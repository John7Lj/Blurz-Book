
from sqlmodel.ext.asyncio.session import AsyncSession
from .schema import CreateBook, UpdateBook  # ✅ Fixed: Capital letters
from sqlmodel import select, desc
from src.db.models import Book as BookModel  # ✅ Fixed: Import renamed to avoid conflict
import uuid

class BookService:
    
    async def get_books(self, session: AsyncSession):
        statement = select(BookModel).order_by(desc(BookModel.updated_at))
        result = await session.exec(statement)
        return result.all()
    
    async def get_book(self, book_id: str, session: AsyncSession):
        try:
            statement = select(BookModel).where(BookModel.id == book_id)
            result = await session.exec(statement)
            book = result.first()
            
            if not book:
                return None  # ✅ Better to return None instead of raising ValueError
            
            return book

        except Exception as e:
            print(f"Error retrieving book: {e}")
            return None
        
        
    async def get_user_books(self,user_id:str, session: AsyncSession):
        statement = select(BookModel).where(BookModel.user_id==user_id).order_by(desc(BookModel.created_at))
        result = await session.exec(statement)
        return result.all()
           
        
    
    async def create_book(self, data: CreateBook, id:uuid.UUID, session: AsyncSession):
        new_book_dict = data.model_dump()
        
        new_book = BookModel(**new_book_dict)
        new_book.user_id = id
        session.add(new_book) 
        
        await session.commit()
        await session.refresh(new_book) 
        return new_book
    
    async def update_book(self, book_id: str, data: UpdateBook, session: AsyncSession):
        updated_book = data.model_dump()  
        try:
            get_the_book = await self.get_book(book_id, session)
            if get_the_book:
                for key, value in updated_book.items():
                    setattr(get_the_book, key, value)
                    
                await session.commit()
                await session.refresh(get_the_book)
                return get_the_book
            else:
                print(f'There is no book with this id {book_id}')
                return None

        except Exception as e:
            print(f"There was an error updating this book id {book_id}: {e}")
            return None  # ✅ Added return
    
    async def delete_book(self, book_id: str, session: AsyncSession):
        try:
            is_book_exist = await self.get_book(book_id, session)
            if is_book_exist:
                await session.delete(is_book_exist)
                await session.commit()
                print(f"Book with ID {book_id} deleted successfully.")
                return True  # ✅ Changed: Return True on success
            else:
                print(f"There is no book with this id {book_id}")
                return None
        except Exception as e:
            print(f"There was an error when deleting this book: {e}")
            return None  # ✅ Added return
