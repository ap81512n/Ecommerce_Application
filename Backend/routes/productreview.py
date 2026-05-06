from fastapi import APIRouter, Depends, Request

from Backend.controllers.productreviewControllers import (
    create_product_review,
    delete_review,
    get_product_reviews,
)
from Backend.middleware.auth import authorize_roles, is_authenticated_user
from Backend.models.user import User

router = APIRouter(prefix="/api/v1")


@router.put("/reviews")
async def submit_review(
    request: Request,
    current_user: User = Depends(is_authenticated_user),
):
    """PUT /api/v1/reviews — create or update a product review."""
    return await create_product_review(request, current_user)


@router.get("/product/reviews/{product_id}")
async def product_reviews(
    product_id: str,
    _: User = Depends(is_authenticated_user),
):
    """GET /api/v1/product/reviews/{id} — list all reviews for a product."""
    return await get_product_reviews(product_id)


@router.delete("/products/{product_id}/reviews/{review_id}")
async def remove_review(
    product_id: str,
    review_id: str,
    _: User = Depends(authorize_roles("admin")),
):
    """DELETE /api/v1/products/{productId}/reviews/{reviewId} — admin delete review."""
    return await delete_review(product_id, review_id)
