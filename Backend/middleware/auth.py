import os
from typing import Callable

from fastapi import Depends, Request
from jose import JWTError, jwt

from Backend.models.user import User
from Backend.utils.errorHandler import ErrorHandler


async def is_authenticated_user(request: Request) -> User:
    """FastAPI dependency — mirrors isAuthenticatedUser Express middleware.

    Reads the JWT from the 'token' cookie, verifies it, and returns the
    matching User document. Raises 401 if the token is missing or invalid.
    """
    token = request.cookies.get("token")
    if not token:
        raise ErrorHandler("Login first to access this resource", 401)

    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user_id = payload.get("id")
    except JWTError:
        raise ErrorHandler("Invalid or expired token", 401)

    user = await User.get(user_id)
    if not user:
        raise ErrorHandler("User not found", 404)

    return user


def authorize_roles(*roles: str) -> Callable:
    """Dependency factory — mirrors authorizeRoles('admin') in Express.

    Usage: Depends(authorize_roles("admin"))
    """
    async def check_role(user: User = Depends(is_authenticated_user)) -> User:
        if user.role not in roles:
            raise ErrorHandler(
                f"Role '{user.role}' is not allowed to access this resource", 403
            )
        return user

    return check_role
