
from fastapi import APIRouter, status, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.exceptions import HTTPException
from typing import List
from .schema import Book, UpdateBook, CreateBook,ReviewBook
from .service import BookService
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.auth.dependencies import AccessTokenBearer,CheckRoler,get_current_user
from src.db.models import User
import os
import shutil
import uuid
from pathlib import Path



# objects definations 
book_router = APIRouter()
 
book_service = BookService()  

Bearer = AccessTokenBearer()

checkroler = Depends(CheckRoler(['admin','user']))
# Create uploads directory
UPLOAD_DIR = Path("uploads/ebooks")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".epub", ".mobi", ".azw", ".azw3"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


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
        raise HTTPException(status_code=404, detail="Book not found or you dont have any books")
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


@book_router.post('/upload_ebook/{book_id}', dependencies=[checkroler])
async def upload_ebook(
    book_id: str,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    user_data: User = Depends(get_current_user)
):
    # 1. Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    # 3. Get the book and verify ownership
    book = await book_service.get_book(book_id, session)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Ensure user_id comparison is safe
    if str(book.user_id) != str(user_data.id):
        raise HTTPException(status_code=403, detail="Not your book")
    
    # 4. Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    UPLOAD_DIR = Path("uploads")

    file_path = Path(UPLOAD_DIR) / "ebooks" / unique_filename
    # 5. Save file to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # 6. Update book record in DB
    book.file_path = str(file_path)
    book.file_size = file_size
    book.file_type = file_ext.lstrip('.')
    
    await session.commit()
    await session.refresh(book)
    
    return {
        "message": "Ebook uploaded successfully",
        "file_path": str(file_path),
        "file_size": file_size,
        "file_type": file_ext.lstrip('.')
    }


@book_router.get('/download_ebook/{book_id}', dependencies=[checkroler])
async def download_ebook(
    book_id: str,
    session: AsyncSession = Depends(get_session),
    user_data: User = Depends(get_current_user)
):
    book = await book_service.get_book(book_id, session)
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if not book.file_path:
        raise HTTPException(status_code=404, detail="No ebook file uploaded")
    
    if not os.path.exists(book.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    # Return file for download
    return FileResponse(
        path=book.file_path,
        filename=f"{book.title}.{book.file_type}",
        media_type="application/octet-stream"
    )