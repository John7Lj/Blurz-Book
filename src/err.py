from typing import Any
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi import FastAPI, status


class AppError(Exception):
    """Base class for all application errors"""
    pass


class InvalidToken(AppError):
    """Token is invalid or corrupted"""
    pass


class TokenExpired(AppError):
    """Token has expired"""
    pass


class RevokedToken(AppError):
    """Token has been revoked"""
    pass


class AccessTokenRequired(AppError):
    """Access token is required but not provided"""
    pass


class RefreshTokenRequired(AppError):
    """Refresh token is required but not provided"""
    pass


class UserAlreadyExists(AppError):
    """User with this email already exists"""
    pass


class InvalidCredentials(AppError):
    """Invalid email or password"""
    pass


class InsufficientPermission(AppError):
    """User lacks necessary permissions"""
    pass


class BookNotFound(AppError):
    """Book not found"""
    pass


class TagNotFound(AppError):
    """Tag not found"""
    pass


class TagAlreadyExists(AppError):
    """Tag already exists"""
    pass


class UserNotFound(AppError):
    """User not found"""
    pass


class EmailNotVerified(AppError):
    """User email has not been verified"""
    pass


class VerificationError(AppError):
    """Error during email verification process"""
    pass
class UserAlreadyVerify(AppError):
    """Error during email verification process"""
    pass

class DataNotFound(AppError):
    pass

class PasswordAlreadyReset(AppError):
    pass
class PasswordNotMatced(AppError):
    pass


# Exception registry with proper error codes and messages
register_exception = {
    InvalidToken: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "initial_detail": {
            "message": "The provided token is invalid or corrupted",
            "error_code": "invalid_token",
        }
    },
    
    TokenExpired: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "initial_detail": {
            "message": "The verification link has expired. Please request a new one",
            "error_code": "token_expired",
        }
    },
    
    RevokedToken: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "initial_detail": {
            "message": "This token has been revoked",
            "error_code": "token_revoked",
        }
    },
    
    AccessTokenRequired: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "initial_detail": {
            "message": "Access token is required for this operation",
            "error_code": "access_token_required",
        }
    },
    
    RefreshTokenRequired: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "initial_detail": {
            "message": "Refresh token is required for this operation",
            "error_code": "refresh_token_required",
        }
    },
    
    UserNotFound: {
        "status_code": status.HTTP_404_NOT_FOUND,
        "initial_detail": {
            "message": "User not found",
            "error_code": "user_not_found",
        }
    },
    
    UserAlreadyExists: {
        "status_code": status.HTTP_409_CONFLICT,
        "initial_detail": {
            "message": "A user with this email already exists",
            "error_code": "user_exists",
        }
    },
    
    InvalidCredentials: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "initial_detail": {
            "message": "Invalid email or password",
            "error_code": "invalid_credentials",
        }
    },
    
    InsufficientPermission: {
        "status_code": status.HTTP_403_FORBIDDEN,
        "initial_detail": {
            "message": "You don't have permission to perform this action",
            "error_code": "insufficient_permission",
        }
    },
    
    EmailNotVerified: {
        "status_code": status.HTTP_403_FORBIDDEN,
        "initial_detail": {
            "message": "Please verify your email before logging in",
            "error_code": "email_not_verified",
        }
    },
    
    VerificationError: {
        "status_code": status.HTTP_403_FORBIDDEN,
        "initial_detail": {
            "message": "There was an error verifying your email",
            "error_code": "verification_error",
            'resoluttion':'verify your email first'
        }
    },
    
    BookNotFound: {
        "status_code": status.HTTP_404_NOT_FOUND,
        "initial_detail": {
            "message": "Book not found",
            "error_code": "book_not_found",
        }
    },
    
    TagNotFound: {
        "status_code": status.HTTP_404_NOT_FOUND,
        "initial_detail": {
            "message": "Tag not found",
            "error_code": "tag_not_found",
        }
    },
    
    TagAlreadyExists: {
        "status_code": status.HTTP_409_CONFLICT,
        "initial_detail": {
            "message": "A tag with this name already exists",
            "error_code": "tag_exists",
        }
    },
    
    UserAlreadyVerify: {
        "status_code": status.HTTP_400_BAD_REQUEST,
        "initial_detail": {
            "message": 'already verify ',
            "error_code": "Verified email",
        }
    },
    PasswordAlreadyReset: {
        "status_code": status.HTTP_400_BAD_REQUEST,
        "initial_detail": {
            "message": 'already reset with this URL ',
            "error_code": "password is reset and this link is expired  ",
        }
    },           
    PasswordNotMatced: {
        "status_code": status.HTTP_400_BAD_REQUEST,
        "initial_detail": {
            "message": 'passwords not matched  ',
            "error_code": "NOT MATCHED  ",

        }
    },
   
    DataNotFound: {
        "status_code": status.HTTP_400_BAD_REQUEST,
        "initial_detail": {
            "message": 'NO data provided  ',
            "error_code": "lackness of data ",
        }
    },
}


def registery(status_code: int, detail: Any):
    """Create exception handler with proper status code and detail"""
    async def error_handler(req: Request, exc: AppError):
        return JSONResponse(
            content={
                "status_code": status_code,
                "detail": detail
            },
            status_code=status_code
        )
    return error_handler


def creation_exceptions(app: FastAPI):
    """Register all exception handlers with the FastAPI app"""
    for excp, exc_info in register_exception.items():
        app.add_exception_handler(
            excp,
            registery(
                status_code=exc_info['status_code'],
                detail=exc_info['initial_detail']
            )
        )