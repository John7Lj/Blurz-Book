from fastapi import APIRouter,Depends
from .service import Review_Service
from src.auth.dependencies import get_current_user,CheckRoler
from sqlmodel.ext.asyncio.session import AsyncSession
from .schema import CreateReview
from src.db.models import Review,User
from src.db.main import get_session
from src.book.schema import ReviewBook

review_router = APIRouter()

review_service = Review_Service()

checkroler = Depends(CheckRoler(['admin','user']))


@review_router.post('/add_review/{book_id}',response_model=Review,dependencies=[checkroler])
async def add_review(review_data:CreateReview,
                     book_id:str,
                     user_details:User=Depends(get_current_user),
                     session:AsyncSession=Depends(get_session)):
    
    
    user_email =user_details.email
    
    return await review_service.add_review(review_data,
                              book_id,
                              user_email,
                              session)
    
    
