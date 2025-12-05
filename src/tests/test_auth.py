
prefix = '/api/v1/auth'
from src.auth.service import User_Service
user = User_Service()


async def test_user_creation(user_mock,mocking_session,test_client):
    
    response = test_client.post(
        json={
    "username": "johnhoho",
    "email": "fliuyh@gmail.com",
    "first_name": "john",
    "last_name": "hh",
    "password":"Ah123456789"},
    url=f'{prefix}/signup'
    )
    calling = await user.user_exist

    
    
    assert user_mock.calling.called_once()
    
    
    
    