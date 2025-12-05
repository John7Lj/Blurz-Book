
from fastapi import APIRouter, status, Depends
from fastapi.exceptions import HTTPException
from typing import List
from .schema import Book, UpdateBook, CreateBook,ReviewBook
from .service import BookService
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.auth.dependencies import AccessTokenBearer,CheckRoler,get_current_user
from src.db.models import User

# objects definations 
book_router = APIRouter()
 
book_service = BookService()  

Bearer = AccessTokenBearer()

checkroler = Depends(CheckRoler(['admin','user']))


@book_router.get('/hello')  
async def hi():
    return {"message": "hello"}


@book_router.get('/', response_model=List[ReviewBook],dependencies=[checkroler])  
async def get_books(session: AsyncSession = Depends(get_session),
                    _:dict=Depends(Bearer)):
    
    
    books = await book_service.get_books(session)
    return books


@book_router.get('/{id}', response_model=ReviewBook,dependencies=[checkroler])  
async def get_a_book(id: str, 
                     session: AsyncSession = Depends(get_session)):
    get_book = await book_service.get_book(id, session)
    if not get_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return get_book

"""get the user books only """
#  here we can get the user id from the get me route in the auth.routes we can excatract the id from the token

@book_router.get('/user/{user_id}', response_model=list[Book],dependencies=[checkroler])  
async def get_user_books(
                     user_id: str, 
                     session: AsyncSession = Depends(get_session)
                     ):
    
    get_book = await book_service.get_user_books(user_id, session)
    if not get_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return get_book



@book_router.post('/create_book', status_code=status.HTTP_201_CREATED, response_model=Book,dependencies=[checkroler])  
async def create_book(data: CreateBook,
                      session: AsyncSession = Depends(get_session),
                      _:dict=Depends(Bearer),
                      user_data:User=Depends(get_current_user)): 

    user_id = user_data.id
    
    new_book = await book_service.create_book(data, user_id,session)
    return new_book





@book_router.patch('/update_book/{id}', response_model=Book,dependencies=[checkroler]) 
async def update_a_book(id: str
                        , data: UpdateBook
                        , session: AsyncSession = Depends(get_session)): 
    updated_book = await book_service.update_book(id, data, session)
    if not updated_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated_book


@book_router.delete('/delete_book/{id}', status_code=status.HTTP_204_NO_CONTENT,dependencies=[checkroler])
async def delete_book(id: str,
                      session: AsyncSession = Depends(get_session)):
    deleted_book = await book_service.delete_book(id, session)
    if deleted_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return None  # For 204 responses