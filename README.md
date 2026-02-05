

this is the stucture of my book web app , this app is intended to show you how muliple services work togother like auth , DB engine ,
celery (background processing), fastapi , email service and other services during the merge or updating the DB like aulumbic 



Instructions for running this app (notice this instructuions for windows) ::
server , DB , celery and env variables ::

first server :: 
1:go to the server folder by commmand line or powershell: cd server
2:you must have installed python v12 then create and activate python environment to isolate the packages from in the machine by: python -m venv .venv
then actiavte by :.venv\Scripts\activate.bat
3:installing depedencies by : pip install -r requirements.txt
4:the final step for server running is uvicorn main:app --reload

second DB
1: you have to install postgresql then 



