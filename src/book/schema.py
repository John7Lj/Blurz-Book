
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
    created_at: datetime
    updated_at: datetime


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