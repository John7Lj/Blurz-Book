from celery import Celery
from asgiref.sync import async_to_sync
from src.mailserver.service import send_email,mail

app  = Celery()

# still don't know how this config works but you must know how is done 

app.config_from_object('src.celery.celery_config')


@app.task()
def bg_send_mail(rec:list[str],sub:str,html_path:str,data_var:dict=None):
    
    message = send_email(recepients=rec,subject=sub,html_message_path=html_path,data_variables=data_var)
    
    # we use here this adapter for making async function work in sync context cause celery is syncrounous  

    async_to_sync(mail.send_message)(message)
    
    print('Email is sent')


