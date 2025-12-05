from pydantic import BaseModel,Field
import uuid
from datetime import datetime


class Review(BaseModel):
    id: uuid.UUID 
    
    rating:int=Field(
        le=5,
    )
    
    comment:str=Field(max_length=80)
    user_id:uuid.UUID | None 
    book_id:uuid.UUID | None 
    created_at:datetime | None
    updated_at: datetime | None

class CreateReview(BaseModel):
 
    rating:int=Field(
        le=5,
    )
    comment:str=Field(max_length=80)
 
 
