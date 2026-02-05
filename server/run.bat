server commands
//create virtual environment::

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.venv\Scripts\Activate.ps1

//run server::

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

// run celery::

celery -A src.celery.celery_tasks worker --loglevel=info --pool=solo


// about redis::
you have to only to download redis server from  this link https://release-assets.githubusercontent.com/github-production-release-asset/3402186/124bda0a-3fa5-11e6-8c4a-803581ed704c?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-01-30T21%3A17%3A00Z&rscd=attachment%3B+filename%3DRedis-x64-3.0.504.msi&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-01-30T20%3A16%3A23Z&ske=2026-01-30T21%3A17%3A00Z&sks=b&skv=2018-11-09&sig=3LgycGD1xr%2BSYYEtvevT6q%2Bw6C7exVjLMv8%2FIuk0IYY%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc2OTgwNTg3NCwibmJmIjoxNzY5ODA1NTc0LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.xESA9Av1yODr6u7ALjBwrZPz1ENJdpsJGW4aNF9q__U&response-content-disposition=attachment%3B%20filename%3DRedis-x64-3.0.504.msi&response-content-type=application%2Foctet-stream
and install it on your system then run it but through the installation make sure its port is 6379 

//run migrations::
alembic revision --autogenerate -m "add ur comments here "
alembic upgrade head
















project i have to make :

1- 
chat app like watsapp 

2-
streaming app like twitch 

3-
blockchain app 

4-
simple ecommerce app

5-
simple social media app

6-
simple blog app

7-
simple ai model app


