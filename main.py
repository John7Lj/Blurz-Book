from fastapi import FastAPI  ,status
from src.book.routes import book_router
from src.mailserver.routes import mail_router
from  fastapi.requests import Request
from src.auth.routes import auth_router
from contextlib import asynccontextmanager
from src.db.main import init_db
from src.reviews.routes import review_router
from src.errors import register_error_handlers
from src.err import creation_exceptions
from fastapi.responses import JSONResponse
from src.middleware import custome_simple_middle

@asynccontextmanager # this IS A dicorator act like class function that excute a fuctions before that happen and ecxute a function after an evernt
async def life_span(app:FastAPI):
#here the instructions that be run first when the server run

 print("the server has been started")
 # this is a async
 await init_db()
 
 yield #this word seperate that when the server start before it will run first ,
 #after it run when the server will be stoppped the instruction excute
 print("the server has been stopped")

version = "v1"

app = FastAPI(version=version,title="Blurz Book service",
              description="a high performance book web service",
              lifespan=life_span,
              redoc_url=f"/api/{version}/redocs",
              docs_url=f"/api/{version}/docs",
              contact={"email":"ffliuyh@gmail.com"},
                          
 ) 



"""this is exceptions registers """
creation_exceptions(app)


custome_simple_middle(app)


async def internal_server_error(e:Exception,r:Request):

            return JSONResponse(
                content={
                    
                    "message": "Oops! Something went wrong",
                    "error_code": "server_error",
                    'status_code':status.HTTP_500_INTERNAL_SERVER_ERROR,

                },
            )



app.add_exception_handler(500,internal_server_error)


app.include_router(book_router, prefix=f"/api/{version}/book",tags="book") 
app.include_router(auth_router, prefix=f"/api/{version}/auth",tags="auth") 
app.include_router(review_router, prefix=f"/api/{version}/reviews",tags="reviews") 
app.include_router(mail_router, prefix=f"/api/{version}/emails",tags="emails") 


"""Experimental endpoint to check the overriding of the exception will happen or not """

async def crash_by_division_zero ():
    return 4/0

app.add_api_route(path='/crash',
                 endpoint =  crash_by_division_zero,
                  methods=['GET']
                       )