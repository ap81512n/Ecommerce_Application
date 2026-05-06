from fastapi import APIRouter, Depends, Request, Response

from Backend.controllers.authControllers import (
    change_password,
    delete_user_by_admin,
    forgot_password,
    get_admin_user_by_id,
    get_all_admin_users,
    get_current_user_details,
    login_user,
    logout_user,
    register_user,
    reset_password,
    update_user_profile,
    update_user_profile_by_admin,
    upload_avatar,
)
from Backend.middleware.auth import authorize_roles, is_authenticated_user
from Backend.models.user import User

router = APIRouter(prefix="/api/v1")


# ── Public ────────────────────────────────────────────────────────────────────

@router.post("/register")
async def register(request: Request, response: Response):
    """POST /api/v1/register"""
    return await register_user(request, response)


@router.post("/login")
async def login(request: Request, response: Response):
    """POST /api/v1/login"""
    return await login_user(request, response)


@router.post("/logout")
async def logout(response: Response):
    """POST /api/v1/logout  (frontend uses POST; original Node.js used GET)"""
    return await logout_user(response)


@router.post("/password/forgot")
async def password_forgot(request: Request):
    """POST /api/v1/password/forgot"""
    return await forgot_password(request)


@router.put("/password/reset/{token}")
async def password_reset(token: str, request: Request, response: Response):
    """PUT /api/v1/password/reset/{token}"""
    return await reset_password(token, request, response)


# ── Authenticated User ────────────────────────────────────────────────────────

@router.get("/me")
async def me(current_user: User = Depends(is_authenticated_user)):
    """GET /api/v1/me"""
    return await get_current_user_details(current_user)


@router.put("/password/update")
async def password_update(
    request: Request,
    response: Response,
    current_user: User = Depends(is_authenticated_user),
):
    """PUT /api/v1/password/update  (frontend uses this path)"""
    return await change_password(request, current_user, response)


@router.put("/me/updateprofile")
async def update_profile(
    request: Request,
    current_user: User = Depends(is_authenticated_user),
):
    """PUT /api/v1/me/updateprofile"""
    return await update_user_profile(request, current_user)


@router.put("/me/upload_avatar")
async def avatar_upload(
    request: Request,
    current_user: User = Depends(is_authenticated_user),
):
    """PUT /api/v1/me/upload_avatar"""
    return await upload_avatar(request, current_user)


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("/admin/users")
async def admin_users(_: User = Depends(authorize_roles("admin"))):
    """GET /api/v1/admin/users"""
    return await get_all_admin_users()


@router.get("/admin/userid/{user_id}")
async def admin_user_by_id(
    user_id: str,
    _: User = Depends(authorize_roles("admin")),
):
    """GET /api/v1/admin/userid/{id}"""
    return await get_admin_user_by_id(user_id)


@router.put("/admin/user/update/{user_id}")
async def admin_update_user(
    user_id: str,
    request: Request,
    _: User = Depends(authorize_roles("admin")),
):
    """PUT /api/v1/admin/user/update/{id}"""
    return await update_user_profile_by_admin(user_id, request)


@router.delete("/admin/user/delete/{user_id}")
async def admin_delete_user(
    user_id: str,
    _: User = Depends(authorize_roles("admin")),
):
    """DELETE /api/v1/admin/user/delete/{id}"""
    return await delete_user_by_admin(user_id)
