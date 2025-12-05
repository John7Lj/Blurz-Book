from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine  
from  .config import config
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession 
engine = create_async_engine(
        config.DB_URL,
            )


async def init_db():
    async with engine.begin() as conn :
       await conn.run_sync(SQLModel.metadata.create_all)
       

async_session = sessionmaker(
    bind = engine ,
    class_=AsyncSession,
    expire_on_commit= False
)
   
       
async def get_session():
    async with async_session() as session:
        yield session

