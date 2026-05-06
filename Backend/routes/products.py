from fastapi import APIRouter, Depends, Request

from Backend.controllers.productControllers import (
    delete_product,
    get_product,
    get_product_details,
    new_product,
    update_product_details,
)
from Backend.middleware.auth import authorize_roles, is_authenticated_user
from Backend.models.user import User

router = APIRouter(prefix="/api/v1")


@router.get("/products")
async def products_list(request: Request):
    """GET /api/v1/products — list all products with search/filter/pagination."""
    return await get_product(request)


@router.post("/admin/products")
async def create_product(
    request: Request,
    current_user: User = Depends(authorize_roles("admin")),
):
    """POST /api/v1/admin/products — create product (admin only)."""
    return await new_product(request, current_user)


@router.get("/products/{product_id}")
async def product_detail(product_id: str):
    """GET /api/v1/products/{id} — single product detail."""
    return await get_product_details(product_id)


@router.put("/admin/products/{product_id}")
async def update_product(
    product_id: str,
    request: Request,
    current_user: User = Depends(authorize_roles("admin")),
):
    """PUT /api/v1/admin/products/{id} — update product (admin only)."""
    return await update_product_details(product_id, request)


@router.delete("/admin/products/{product_id}")
async def remove_product(
    product_id: str,
    current_user: User = Depends(authorize_roles("admin")),
):
    """DELETE /api/v1/admin/products/{id} — delete product (admin only)."""
    return await delete_product(product_id)
