import hashlib
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import Request, Response, UploadFile
from fastapi.responses import JSONResponse

from Backend.models.user import User
from Backend.utils.emailTemplates import reset_password_email_template
from Backend.utils.errorHandler import ErrorHandler
from Backend.utils.sendEmail import send_email
from Backend.utils.sendToken import send_token


# ── Auth ──────────────────────────────────────────────────────────────────────

async def register_user(request: Request, response: Response) -> JSONResponse:
    """Create a new user account and return a JWT cookie.

    Mirrors: registerUser in authControllers.js
    POST /api/v1/register
    """
    data = await request.json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    existing = await User.find_one(User.email == email)
    if existing:
        raise ErrorHandler("Email already registered", 400)

    user = User(name=name, email=email, password=password)
    await user.insert()

    token_data = send_token(user, 201, response)
    return JSONResponse(
        {"success": True, "user": _serialize_user(user), **token_data},
        status_code=201,
    )


async def login_user(request: Request, response: Response) -> JSONResponse:
    """Validate credentials and return a JWT cookie.

    Mirrors: loginUser in authControllers.js
    POST /api/v1/login
    """
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise ErrorHandler("Please enter email and password", 400)

    # password field has select:false equivalent — fetch it explicitly
    user = await User.find_one(User.email == email)
    if not user:
        raise ErrorHandler("Invalid email or password", 401)

    if not user.match_password(password):
        raise ErrorHandler("Invalid email or password", 401)

    token_data = send_token(user, 200, response)
    return JSONResponse(
        {"success": True, "user": _serialize_user(user), **token_data},
        status_code=200,
    )


async def logout_user(response: Response) -> JSONResponse:
    """Clear the JWT cookie.

    Mirrors: logoutUser in authControllers.js
    POST /api/v1/logout  (note: original was GET, fixed to match frontend)
    """
    response.delete_cookie("token")
    return JSONResponse({"success": True, "message": "Logged out"})


async def forgot_password(request: Request) -> JSONResponse:
    """Send a password-reset email.

    Mirrors: forgotPassword in authControllers.js
    POST /api/v1/password/forgot
    """
    data = await request.json()
    email = data.get("email")

    user = await User.find_one(User.email == email)
    if not user:
        raise ErrorHandler("User not found with this email", 404)

    raw_token = user.get_reset_password_token()
    await user.save()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_url = f"{frontend_url}/password/reset/{raw_token}"

    message = reset_password_email_template(user.name, reset_url)
    await send_email({"email": user.email, "subject": "EcommerceApp Password Reset", "message": message})

    return JSONResponse({"success": True, "message": f"Email sent to {user.email}"})


async def reset_password(token: str, request: Request, response: Response) -> JSONResponse:
    """Reset password using the token from the email link.

    Mirrors: resetPassword in authControllers.js
    PUT /api/v1/password/reset/{token}
    """
    hashed = hashlib.sha256(token.encode()).hexdigest()

    user = await User.find_one(
        User.reset_password_token == hashed,
        User.reset_password_expire > datetime.now(timezone.utc),
    )
    if not user:
        raise ErrorHandler("Password reset token is invalid or has expired", 400)

    data = await request.json()
    new_password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if new_password != confirm_password:
        raise ErrorHandler("Passwords do not match", 400)

    user.password = new_password
    user.reset_password_token = None
    user.reset_password_expire = None
    await user.save()

    token_data = send_token(user, 200, response)
    return JSONResponse({"success": True, **token_data})


# ── Current User ───────────────────────────────────────────────────────────────

async def get_current_user_details(current_user: User) -> JSONResponse:
    """Return the authenticated user's profile.

    Mirrors: getCurrentUserDetails in authControllers.js
    GET /api/v1/me
    """
    return JSONResponse({"success": True, "user": _serialize_user(current_user)})


async def change_password(request: Request, current_user: User, response: Response) -> JSONResponse:
    """Change the current user's password.

    Mirrors: changePassword in authControllers.js
    PUT /api/v1/password/update
    """
    data = await request.json()
    old_password = data.get("oldPassword")
    new_password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not current_user.match_password(old_password):
        raise ErrorHandler("Old password is incorrect", 400)

    if new_password != confirm_password:
        raise ErrorHandler("Passwords do not match", 400)

    current_user.password = new_password
    await current_user.save()

    token_data = send_token(current_user, 200, response)
    return JSONResponse({"success": True, **token_data})


async def update_user_profile(request: Request, current_user: User) -> JSONResponse:
    """Update name and email of the current user.

    Mirrors: updateUserProfile in authControllers.js
    PUT /api/v1/me/updateprofile
    """
    data = await request.json()
    name = data.get("name", current_user.name)
    email = data.get("email", current_user.email)

    await current_user.set({"name": name, "email": email, "updated_at": datetime.now(timezone.utc)})
    user = await User.get(str(current_user.id))
    return JSONResponse({"success": True, "user": _serialize_user(user)})


async def upload_avatar(request: Request, current_user: User) -> JSONResponse:
    """Placeholder for avatar upload — real implementation requires cloud storage.

    Mirrors: uploadAvatar in authControllers.js
    PUT /api/v1/me/upload_avatar
    """
    data = await request.json()
    avatar_url = data.get("avatar")

    await current_user.set({
        "avatar": {"public_id": "avatar_placeholder", "url": avatar_url},
        "updated_at": datetime.now(timezone.utc),
    })
    user = await User.get(str(current_user.id))
    return JSONResponse({"success": True, "user": _serialize_user(user)})


# ── Admin User Management ─────────────────────────────────────────────────────

async def get_all_admin_users() -> JSONResponse:
    """Return all users (admin only).

    Mirrors: getAllAdminUsers in authControllers.js
    GET /api/v1/admin/users
    """
    users = await User.find_all().to_list()
    return JSONResponse({"success": True, "users": [_serialize_user(u) for u in users]})


async def get_admin_user_by_id(user_id: str) -> JSONResponse:
    """Return a single user by ID (admin only).

    Mirrors: getAdminUserById in authControllers.js
    GET /api/v1/admin/userid/{id}
    """
    user = await _get_user_or_404(user_id)
    return JSONResponse({"success": True, "user": _serialize_user(user)})


async def update_user_profile_by_admin(user_id: str, request: Request) -> JSONResponse:
    """Update name, email, and role of any user (admin only).

    Mirrors: updateUserProfileByAdmin in authControllers.js
    PUT /api/v1/admin/user/update/{id}
    """
    user = await _get_user_or_404(user_id)
    data = await request.json()

    update = {k: v for k, v in data.items() if k in ("name", "email", "role")}
    update["updated_at"] = datetime.now(timezone.utc)
    await user.set(update)

    user = await User.get(user_id)
    return JSONResponse({"success": True, "user": _serialize_user(user)})


async def delete_user_by_admin(user_id: str) -> JSONResponse:
    """Delete a user account (admin only).

    Mirrors: deleteUserByAdmin in authControllers.js
    DELETE /api/v1/admin/user/delete/{id}
    """
    user = await _get_user_or_404(user_id)
    await user.delete()
    return JSONResponse({"success": True, "message": "User deleted"})


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_user_or_404(user_id: str) -> User:
    try:
        user = await User.get(user_id)
    except Exception:
        user = None
    if not user:
        raise ErrorHandler(f"User not found with id: {user_id}", 404)
    return user


def _serialize_user(user: User) -> dict:
    """Convert a User document to a JSON-serialisable dict (no password)."""
    d = user.model_dump()
    d["_id"] = str(user.id)
    d.pop("id", None)
    d.pop("password", None)
    d.pop("reset_password_token", None)
    d.pop("reset_password_expire", None)
    for key in ("created_at", "updated_at"):
        if isinstance(d.get(key), datetime):
            d[key] = d[key].isoformat()
    return d
