from sqlmodel import SQLModel ,Field,Column,Relationship
import uuid
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from typing import List,TYPE_CHECKING,Optional



class User (SQLModel,table=True):
    __tablename__="User" 
    id: uuid.UUID = Field(
            sa_column=Column(
                pg.UUID,               primary_key=True,
                nullable=False,
                default = uuid.uuid4)
        )
    username:str
    email:str
    first_name:str
    last_name:str
    role:str= Field(sa_column=Column(
        pg.VARCHAR,
        nullable=False,
        server_default="user"
    ))
    
    
    books:List["Book"]=Relationship(
                         back_populates="user",
                                    sa_relationship_kwargs={'lazy':'selectin'})
    reviews:List["Review"]=Relationship(
                         back_populates="user",
                                    sa_relationship_kwargs={'lazy':'selectin'})
       
    password_hash:str=Field(exclude=True)
    is_verifed:bool=Field(default=False)
    created_at: datetime | None = Field(default_factory=datetime.now)
    updated_at: datetime | None = Field(default_factory=datetime.now)
    
    
    def __repr__(self):
        return f"User(username={self.username})"
    
    

class Book(SQLModel, table=True):
    __tablename__ = "Book"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID, 
            primary_key=True,
            nullable=False,
            default = uuid.uuid4)
    )
    
    user_id:uuid.UUID | None = Field(default=None, foreign_key="User.id")
    title: str = Field(nullable=False)
    author: str | None = None
    description:str
    page_count: int | None = None
    category:str
    user:Optional['User'] = Relationship(
        back_populates="books"  
    )
    reviews:List["Review"]=Relationship(
                         back_populates="book",
                                    sa_relationship_kwargs={'lazy':'selectin'})
       
    publisher: str | None = None
    published_date: datetime | None = Field(default_factory=datetime.now)
    language: str | None = None
    created_at: datetime | None = Field(default_factory=datetime.now)
    updated_at: datetime | None = Field(default_factory=datetime.now)

    def __repr__(self):
        return f"Book(title={self.title})"
   
   
   
class Review(SQLModel, table=True):
    __tablename__ = "Review"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID, 
            primary_key=True,
            nullable=False,
            default = uuid.uuid4)
    )
    
    rating:int=Field(
        le=5,
    )
    
    comment:str=Field(max_length=80)
    user_id:uuid.UUID | None = Field(default=None, foreign_key="User.id")
    book_id:uuid.UUID | None = Field(default=None, foreign_key="Book.id")
    created_at:datetime | None=Field(default_factory=datetime.now)
    updated_at: datetime | None = Field(default_factory=datetime.now)
    
    user:Optional['User'] = Relationship(
        back_populates="reviews"  
    )
    
    book:Optional['Book'] = Relationship(
        back_populates="reviews"  
    )
    
    
    def __repr__(self):
        return f"This review {self.book_id} is made by this user:{self.user_id}"
   
   
   