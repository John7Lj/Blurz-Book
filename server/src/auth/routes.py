from fastapi import APIRouter, Depends, status, HTTPException
from src.db.main import get_session
from .service import User_Service
from .schema import Create_User as Create_User_Model, User,Login_User,UserInfo,Password_Reset,Password_reset_Confirm
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.exc import IntegrityError
from .utils import access_token,verify_password,CreationSafeLink,generate_hashed_password
from datetime import datetime,timedelta
from src.db.config import config
from fastapi.responses import JSONResponse
from .dependencies import RefreshToken,AccessTokenBearer,get_current_user,CheckRoler
from src.err import AccessTokenRequired,UserAlreadyExists,UserNotFound,InvalidCredentials,VerificationError,DataNotFound,PasswordAlreadyReset,UserAlreadyVerify
from src.db.redis import add_to_blacklist,check_blacklist
from src.mailserver.service import send_email,mail
from src.celery.celery_tasks import bg_send_mail
from src.db.models import User as User_DB


auth_router = APIRouter()

user_service = User_Service()
checkroler = Depends(CheckRoler(['admin','user']))

access_token_bearer = AccessTokenBearer()

password_reset_link = CreationSafeLink(config.password_secrete_reset,'password_reset_link')

email_verification_link = CreationSafeLink(config.jwt_secret,'email_verification_link')


refresh = timedelta(days=config.refresh_token_expiary)

access = timedelta(minutes=config.access_token_expiary)

@auth_router.post("/signup",
                  response_model=User,
                  status_code=status.HTTP_201_CREATED,
                  )
async def create_user(
    user_data: Create_User_Model, 
    session: AsyncSession = Depends(get_session)
):
    email = user_data.email
    is_existed = await user_service.user_exist(email, session)
    
    if is_existed:
        raise UserAlreadyExists()
    
    try:
        
        new_user = await user_service.create_user(user_data, session)
        token = email_verification_link.create_safe_url({"email":email})
      
        link = f'{config.domain}/auth/verify/{token}'
        
        data = {"link":link}
        
        send_email( rec=[email],
                            sub='verify email',
                            data_var=data,
                            html_path='verify_message.html')# the result is a message that sent to the user wiht link
      
      
        return new_user
    except IntegrityError:
        raise UserAlreadyExists()


@auth_router.post('/resend_verify_link')
async def crtate_url_vreification(email:Password_Reset,session: AsyncSession = Depends(get_session)):
    email = email.email
    if not email :
        raise DataNotFound()
    is_existed = await user_service.user_exist(email, session)
    
    if is_existed:
    
        token = email_verification_link.create_safe_url({"email":email})
      
        link = f'{config.domain}/auth/verify/{token}'
        
        data = {"link":link}
        
        bg_send_mail.delay(rec=[email],sub = 'verifyin mail',html_path='verify_message.html',data_var=data)
        
     



"""verify the URL to check is valid"""  
@auth_router.get("/verify/{token}")

async def activation_user(token:str,session:AsyncSession=Depends(get_session),accesstoken =Depends(AccessTokenBearer)):
    
    data = email_verification_link.de_serializ_url(token)
    
    if await check_blacklist(data['token_id']):
        raise UserAlreadyVerify()
    
    email = data['email']
    if not email:
        raise VerificationError()
    
    await user_service.activation_user(email,session)
    
    await add_to_blacklist(accesstoken['jti'])

    await add_to_blacklist(data['token_id'],exp=1600)

    return JSONResponse(
            content={"message": "Account verified successfully"},
            status_code=status.HTTP_200_OK,
        )    



@auth_router.post('/login',)
async def login_user(user_data:Login_User,session:AsyncSession=Depends(get_session)):
    user_data_login = user_data
    email = user_data_login.email
    password = user_data_login.password
    
    # ADD THESE DEBUG LOGS
    print(f"🔍 LOGIN ATTEMPT:")
    print(f"   Email received: {email}")
    print(f"   Email type: {type(email)}")
    print(f"   Email length: {len(email)}")
    print(f"   Email stripped: '{email.strip()}'")
    
    # check if the user exist or not 
    user_existence:User_DB = await user_service.get_user_by_email(email, session)
    
    print(f"   User found: {user_existence is not None}")
    if user_existence:
        print(f"   Found user: {user_existence.email}")
    
    if not user_existence:
        raise UserNotFound()
      
    is_valid_password = verify_password(password, user_existence.password_hash) 
     
    if is_valid_password:
        
        # Create tokens
        access_token_str = access_token(
            user_data={
                "email": email,
                "id": str(user_existence.id),
                "username": user_existence.username,
            },
            expire=access
        )
        
        refresh_token_str = access_token(
            user_data={
                "email": email,
                "id": str(user_existence.id),
                "username": user_existence.username,
            },
            expire=refresh,
            refresh=True
        )  
        
        return JSONResponse(
            content={
                "message": "you have login successfully",
                "access_token": access_token_str,
                "refresh_token": refresh_token_str,
                "email": email,
                "username": user_existence.username,
                "user_id": str(user_existence.id)
            },
            status_code=200
        )
    else:
        raise InvalidCredentials()

@auth_router.get('/me',response_model=UserInfo,
                    dependencies=[checkroler])

async def get_me(user_details:User=Depends(get_current_user)):
    return user_details

    
@auth_router.post('/refresh_token')
async def get_acces_by_refresh(token:dict=Depends(RefreshToken())):
    
    if token:
        new_access_token = access_token(user_data=token['user'],expire=access)
        
        return JSONResponse(
               content ={
                  "access_token":new_access_token
             } )
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
                        detail='this token either expired or invalid')
     
    
@auth_router.post('/logout')
async def logout(token:dict=Depends(AccessTokenBearer())):
    
    if await add_to_blacklist(token['jti']):
        return JSONResponse(
            content={"Message":"you have loged out successflly"},
            status_code = 200,

        )
    else:
        print('there was an erro while revoking this token ')
    
    
    
    """
    
    notice this for forget Password reset flow , not regular reset password this in case the user forget the original password
    
    1: user request to resent his password 
    
    2: the token or the email exctracted from but be carfull , we check if exist or not then if exist 

    3: we shall send to this user mail an uniuque link that contain a token with period expiration and this email
        
    4: when the user click on this link and the link is valid the user can now reset the password and revoke the token of authorization 
    and add to the redis black list
    
    
    5: after the user has successfully updated the password the access ,refresh and link token must be revoked and added to the redis blacklist
    
    """ 
   # Notice this is for forgetting password and not in normal reset password 
@auth_router.post('/password_reset')
async def passsword_reset(Email:Password_Reset,session:AsyncSession=Depends(get_session),_=Depends(AccessTokenBearer())):
    email = Email.email
    
    user_existence = await user_service.get_user_by_email(email,session)
    
    if not user_existence:
        raise UserNotFound()
    
    try:
        
        token = password_reset_link.create_safe_url({"email":email})
      
        link = f'{config.domain}/auth/confirm_password/{token}'
        
        data = {"link":link}
        
        bg_send_mail.delay(rec=email,
                            data_var=data,html_path='password_reset_link.html',
                            sub = 'Reset Email Password')# the result is a message that sent to mail user wiht link
      
      
    except IntegrityError:
        raise UserAlreadyExists() 
    
@auth_router.post("/confirm_password/{token}")

async def confirm_password(passwords:Password_reset_Confirm
                           ,token:str,session:AsyncSession=Depends(get_session)
                           ,access_token:dict=Depends(AccessTokenBearer()),):
    
    data = password_reset_link.de_serializ_url(token,600)
    
    """check if this link is beeing sent again to prevent it from consuming resourse """
    if await check_blacklist(data['token_id']):
        raise UserAlreadyVerify()
    

    if not passwords.new_password==passwords.confirm_password:
        raise InvalidCredentials()
    
    email = data['email']
    if not email:
        raise DataNotFound()
    try:
        user_exist =  await user_service.get_user_by_email(email,session)
        if not user_exist:
            raise UserNotFound()
    except IntegrityError:
        raise IntegrityError()
    new_password = generate_hashed_password(passwords.new_password)
    user_exist.password_hash = new_password
    await session.commit()
    await session.refresh(user_exist)
    
    """if the user arrive hr this mean the user has successfully verify so we should block this ulr beeing used again"""
    
    await add_to_blacklist(access_token['jti'])
    await add_to_blacklist(data['token_id'],exp=600)
   
    
    return JSONResponse(
            content={"message": "Password has been updated successfully"},
            status_code=status.HTTP_200_OK,
        )  
