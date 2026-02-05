
from pydantic import BaseModel 
import uuid
from datetime import datetime
from src.reviews.schema import Review
from typing import List
class Book(BaseModel): 
    id: uuid.UUID
    title: str
    author: str
    publisher: str
    page_count: int
    category: str
    description:str
    language: str
    published_date: datetime
    created_at: datetime | None = None  # ✅ Made optional
    updated_at: datetime | None = None  # ✅ Made optional
    user_id: uuid.UUID | None = None
    file_path: str | None = None
    file_size: int | None = None
    file_type: str | None = None



class CreateBook(BaseModel):  
    title: str
    author: str
    publisher: str
    published_date: datetime
    page_count: int
    category: str
    description:str
    language: str

  
class UpdateBook(BaseModel): 
    title: str
    author: str
    publisher: str
    published_date: datetime
    page_count: int
    category: str
    description:str
    language: str




class ReviewBook(Book):
    
   reviews:List[Review]