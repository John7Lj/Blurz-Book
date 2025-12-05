from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from src.db.models import User as User_Model
from .schema import Create_User,Update_User
from .utils import generate_hashed_password
from src.err import UserAlreadyExists,UserAlreadyVerify,UserNotFound

import logging
class User_Service:

    async def get_user_by_email(self, email: str, session: AsyncSession):
        statement = select(User_Model).where(User_Model.email == email)
        result = await session.exec(statement)
        user = result.first()
        return user 


    async def user_exist(self, email: str, session: AsyncSession):
        user = await self.get_user_by_email(email, session)
        return bool(user)
    
  
    async def create_user(self, user_data: Create_User, session: AsyncSession):
        user_data_in_dict = user_data.model_dump()
        
        # Swap 'password' for 'password_hash'
        plain_password = user_data_in_dict.pop('password')
        user_data_in_dict['password_hash'] = generate_hashed_password(plain_password)
        
        # Create and save user
        new_user = User_Model(**user_data_in_dict)
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        return new_user
    
    async def update_user(self,email:str,update_data:Update_User,session:AsyncSession):
        
        update_data_dict = update_data.model_dump()
        
        user_exist = self.get_user_by_email(email,session)
        
        if not user_exist:
            raise UserAlreadyExists()
        for key,value in update_data_dict.items():
            setattr(user_exist,key,value)
            
        session.commit()
        await session.refresh(user_exist)
        
        
    async def activation_user(self,email:str,session:AsyncSession):
        
        user_exist : User_Model = await self.get_user_by_email(email,session)
        if not user_exist:
            raise UserNotFound()
        if user_exist.is_verifed:
            raise UserAlreadyVerify()
        user_exist.is_verifed=True
        logging.info(f"User verified successfully: {email}")

        await session.commit()
        await session.refresh(user_exist)
        
      