from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import func
import uuid
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from typing import List, Optional


class User(SQLModel, table=True):
    __tablename__ = "User" 
    
    id: uuid.UUID = Field(
        primary_key=True,
        nullable=False,
        default_factory=uuid.uuid4
    )
    username: str
    email: str
    first_name: str = Field(default="new_user") 
    last_name: str = Field(default="new_user")  
    role: str = Field(
        sa_column=Column(
            pg.VARCHAR,
            nullable=False,
            server_default="user"
        )
    )
    
    books: List["Book"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={
            "lazy": "selectin", 
            "cascade": "all, delete-orphan"
        }
    )
    
    reviews: List["Review"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={
            "lazy": "selectin", 
            "cascade": "all, delete-orphan"
        }
    )
       
    password_hash: str = Field(exclude=True)
    is_verifed: bool = Field(default=False)
    
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            server_default=func.now(),
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )
    
    def __repr__(self):
        return f"User(username={self.username})"


class Book(SQLModel, table=True):
    __tablename__ = "Book"

    id: uuid.UUID = Field(
        primary_key=True,
        nullable=False,
        default_factory=uuid.uuid4
    )
    
    user_id: uuid.UUID | None = Field(default=None, foreign_key="User.id")
    title: str = Field(nullable=False)
    author: str | None = None
    description: str
    page_count: int | None = None
    category: str
    
    user: Optional['User'] = Relationship(back_populates="books")
    
    reviews: List["Review"] = Relationship(
        back_populates="book",
        sa_relationship_kwargs={'lazy': 'selectin'}
    )

    file_path: str | None = None  # Path to the PDF/epub file
    file_size: int | None = None  # Size in bytes
    file_type: str | None = None  # "pdf", "epub", "mobi", etc.
    
    publisher: str | None = None
    published_date: datetime | None = Field(default_factory=datetime.now)
    language: str | None = None
    
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            server_default=func.now(),
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )
    
    def __repr__(self):
        return f"Book(title={self.title})"


class Review(SQLModel, table=True):
    __tablename__ = "Review"

    id: uuid.UUID = Field(
        primary_key=True,
        nullable=False,
        default_factory=uuid.uuid4
    )
    
    rating: int = Field(le=5)
    comment: str = Field(max_length=80)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="User.id")
    book_id: uuid.UUID  = Field(nullable=False, foreign_key="Book.id")
    
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            server_default=func.now(),
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )
    
    user: Optional['User'] = Relationship(back_populates="reviews")
    book: Optional['Book'] = Relationship(back_populates="reviews")
    
    def __repr__(self):
        return f"This review {self.book_id} is made by this user:{self.user_id}"