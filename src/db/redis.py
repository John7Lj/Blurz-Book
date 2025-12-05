from redis.asyncio import Redis
from .config import config

Token_Blacklist = Redis.from_url(config.Redis_Url)

async def add_to_blacklist(jti:str, exp = 1800):
   
    result = await Token_Blacklist.set(name=jti,value='',ex=exp)
    if result :
        print(f'the redis is working    {jti}')
    else:
         print('the redis is not working ')          
    return result

   
async def check_blacklist(jti:str)->bool:
    result =await Token_Blacklist.get(name=jti)
    return result is not None
    