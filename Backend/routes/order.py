from fastapi import APIRouter, Depends, Request

from Backend.controllers.orderControllers import (
    create_order,
    delete_order,
    get_all_orders,
    get_all_orders_of_current_user,
    get_order_details,
    update_order,
)
from Backend.middleware.auth import authorize_roles, is_authenticated_user
from Backend.models.user import User

router = APIRouter(prefix="/api/v1")


@router.post("/order/new")
async def new_order(
    request: Request,
    current_user: User = Depends(is_authenticated_user),
):
    """POST /api/v1/order/new"""
    return await create_order(request, current_user)


@router.get("/order/getdetails/{order_id}")
async def order_details(
    order_id: str,
    _: User = Depends(is_authenticated_user),
):
    """GET /api/v1/order/getdetails/{id}"""
    return await get_order_details(order_id)


@router.get("/order/all/me")
async def my_orders(current_user: User = Depends(is_authenticated_user)):
    """GET /api/v1/order/all/me"""
    return await get_all_orders_of_current_user(current_user)


@router.get("/admin/order")
async def all_orders(_: User = Depends(authorize_roles("admin"))):
    """GET /api/v1/admin/order"""
    return await get_all_orders()


@router.put("/admin/order/update/{order_id}")
async def admin_update_order(
    order_id: str,
    request: Request,
    _: User = Depends(authorize_roles("admin")),
):
    """PUT /api/v1/admin/order/update/{id}"""
    return await update_order(order_id, request)


@router.delete("/admin/order/delete/{order_id}")
async def admin_delete_order(
    order_id: str,
    _: User = Depends(authorize_roles("admin")),
):
    """DELETE /api/v1/admin/order/delete/{id}"""
    return await delete_order(order_id)
