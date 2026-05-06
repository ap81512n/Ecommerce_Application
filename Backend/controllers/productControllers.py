from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import Request
from fastapi.responses import JSONResponse

from Backend.models.product import Product
from Backend.models.user import User
from Backend.utils.apiFilters import APIFilters
from Backend.utils.errorHandler import ErrorHandler


async def get_product(request: Request) -> JSONResponse:
    """Return all products with search, filter, and pagination applied.

    Mirrors: getProduct in productControllers.js
    GET /api/v1/products
    """
    res_per_page = 4
    params = dict(request.query_params)

    api = APIFilters(params)
    api.search().filter()

    filtered_count = await Product.find(api.query).count()

    api.pagination(res_per_page)

    products_docs = await (
        Product.find(api.query).skip(api.skip).limit(api.limit).to_list()
    )

    products = [_serialize_product(p) for p in products_docs]

    return JSONResponse({
        "success": True,
        "filteredProductsCount": filtered_count,
        "resPerPage": res_per_page,
        "products": products,
    })


async def new_product(request: Request, current_user: User) -> JSONResponse:
    """Create a new product (admin only).

    Mirrors: newProduct in productControllers.js
    POST /api/v1/admin/products
    """
    data = await request.json()
    data["user"] = str(current_user.id)
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)

    product = Product(**data)
    await product.insert()

    return JSONResponse(
        {"success": True, "message": "Product created", "product": _serialize_product(product)},
        status_code=201,
    )


async def get_product_details(product_id: str) -> JSONResponse:
    """Return a single product by ID.

    Mirrors: getProductDetails in productControllers.js
    GET /api/v1/products/{id}
    """
    product = await _get_product_or_404(product_id)
    return JSONResponse({"success": True, "product": _serialize_product(product)})


async def update_product_details(product_id: str, request: Request) -> JSONResponse:
    """Update a product's fields.

    Mirrors: updateProductDetails in productControllers.js
    PUT /api/v1/admin/products/{id}
    """
    product = await _get_product_or_404(product_id)
    data = await request.json()
    data["updated_at"] = datetime.now(timezone.utc)

    await product.set(data)
    # Reload to get the updated document
    product = await Product.get(product_id)
    return JSONResponse({"success": True, "product": _serialize_product(product)})


async def delete_product(product_id: str) -> JSONResponse:
    """Delete a product by ID.

    Mirrors: deleteProduct in productControllers.js
    DELETE /api/v1/admin/products/{id}
    """
    product = await _get_product_or_404(product_id)
    await product.delete()
    return JSONResponse({"success": True, "message": "Product deleted"})


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _get_product_or_404(product_id: str) -> Product:
    try:
        product = await Product.get(product_id)
    except Exception:
        product = None
    if not product:
        raise ErrorHandler(f"Product not found with id: {product_id}", 404)
    return product


def _serialize_product(product: Product) -> dict:
    """Convert a Product document to a JSON-serialisable dict."""
    d = product.model_dump()
    d["_id"] = str(product.id)
    d.pop("id", None)
    # Ensure datetimes are ISO strings
    for key in ("created_at", "updated_at"):
        if isinstance(d.get(key), datetime):
            d[key] = d[key].isoformat()
    # Convert enum values
    if hasattr(d.get("category"), "value"):
        d["category"] = d["category"].value
    return d
