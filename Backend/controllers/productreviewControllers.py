from fastapi import Request
from fastapi.responses import JSONResponse

from Backend.models.product import Product, Review
from Backend.models.user import User
from Backend.utils.errorHandler import ErrorHandler


async def create_product_review(request: Request, current_user: User) -> JSONResponse:
    """Create a new review or update the current user's existing review.

    Mirrors: createProductReview in productreviewControllers.js
    PUT /api/v1/reviews
    """
    data = await request.json()
    product_id = data.get("productId")
    rating = float(data.get("rating", 0))
    comment = data.get("comment", "")

    product = await _get_product_or_404(product_id)

    user_str = str(current_user.id)
    existing_index = next(
        (i for i, r in enumerate(product.reviews) if r.user == user_str), None
    )

    if existing_index is not None:
        product.reviews[existing_index].rating = rating
        product.reviews[existing_index].comment = comment
    else:
        product.reviews.append(Review(user=user_str, rating=rating, comment=comment))

    product.num_of_reviews = len(product.reviews)
    product.ratings = (
        sum(r.rating for r in product.reviews) / product.num_of_reviews
        if product.reviews
        else 0
    )

    await product.save()
    return JSONResponse({"success": True, "message": "Review submitted"})


async def get_product_reviews(product_id: str) -> JSONResponse:
    """Return all reviews for a product.

    Mirrors: getProductReviews in productreviewControllers.js
    GET /api/v1/product/reviews/{id}
    """
    product = await _get_product_or_404(product_id)
    reviews = [r.model_dump() for r in product.reviews]
    return JSONResponse({"success": True, "reviews": reviews})


async def delete_review(product_id: str, review_id: str) -> JSONResponse:
    """Delete a specific review and recalculate ratings.

    Mirrors: deleteReview in productreviewControllers.js
    DELETE /api/v1/products/{productId}/reviews/{reviewId}
    """
    product = await _get_product_or_404(product_id)

    original_count = len(product.reviews)
    product.reviews = [r for r in product.reviews if r.user != review_id]

    if len(product.reviews) == original_count:
        raise ErrorHandler(f"Review not found with id: {review_id}", 404)

    product.num_of_reviews = len(product.reviews)
    product.ratings = (
        sum(r.rating for r in product.reviews) / product.num_of_reviews
        if product.reviews
        else 0
    )

    await product.save()
    return JSONResponse({"success": True, "message": "Review deleted"})


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_product_or_404(product_id: str) -> Product:
    try:
        product = await Product.get(product_id)
    except Exception:
        product = None
    if not product:
        raise ErrorHandler(f"Product not found with id: {product_id}", 404)
    return product
