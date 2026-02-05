from pydantic import BaseModel, Field
import uuid
from datetime import datetime
from typing import  List
from src.book.schema import Book
from src.reviews.schema import Review
class User(BaseModel): 
    id: uuid.UUID 
    username: str = Field(max_length=20)
    email: str = Field(max_length=40)
    first_name: str
    last_name: str
    is_verifed: bool 
    created_at: datetime | None = None  # ✅ Made optional
    updated_at: datetime | None = None  # ✅ Made optional




class UserInfo(User):
    books:List[Book]
    reviews:List[Review]

""""password mustn't given at the reponse model"""


class Create_User(BaseModel): 
    username: str = Field(max_length=20)
    email: str = Field(max_length=40)
    first_name: str
    last_name: str
    password: str = Field(min_length=8, max_length=72) 
    

class Update_User(BaseModel): 
    username: str = Field(max_length=20)
    first_name: str
    last_name: str
    is_verifed: bool 
    
    
class User_Activation(BaseModel): 
    is_verifed: bool 



    
class Login_User(BaseModel): 
    email: str = Field(max_length=40)
    password: str = Field(min_length=8, max_length=72) 
    
    
    
class Password_Reset(BaseModel):
    email:str
    
    
class Password_reset_Confirm(BaseModel):
    new_password:str=Field(min_length=8, max_length=72) 
    confirm_password:str=Field(min_length=8, max_length=72) 

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=72)
