from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from src.db.models import User as User_Model
from .schema import CreateReview
from fastapi.exceptions import HTTPException
from src.db.models import Review,User
from fastapi import status,Depends
from src.auth.service import User_Service
from src.book.service import BookService
from src.db.main import get_session
import logging
class Review_Service:
    
    
    
    async def add_review(self,data_review:CreateReview,
                         book_id:str,
                         email:str,
                         session:AsyncSession=Depends(get_session))->object:
        
        
        user_service = User_Service()
        book_service = BookService()
        
        

        try:
            
            user = await user_service.get_user_by_email(email,session)
            
            if not user :
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND)
                
                
            book = await book_service.get_book(book_id,session)
            
            if not book :
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND)
                
            
            data_review_dict = data_review.model_dump()
            
            new_review = Review(**data_review_dict)
            new_review.book = book
            new_review.user = user
            
            session.add(new_review)
            await session.commit()
            await session.refresh(new_review)
            
            return new_review
    
              
        except Exception as e :
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f'ther was an erro {e}')
    
