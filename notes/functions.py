


def decorator_uppercase(func):
    print(f'this function is named {func.__name__}/n and transfer the returned text to upper case')
    def wrapper(name): 
        hi_name  =  func(name)
        return hi_name.upper()
    return wrapper
    
    
 

@decorator_uppercase
def greet(name:str):
    print(f"hello,{name}") 



greet('ahmed')