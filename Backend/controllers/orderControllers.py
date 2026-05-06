from datetime import datetime, timezone

from fastapi import Request
from fastapi.responses import JSONResponse

from Backend.models.order import Order
from Backend.models.product import Product
from Backend.models.user import User
from Backend.utils.errorHandler import ErrorHandler


async def create_order(request: Request, current_user: User) -> JSONResponse:
    """Create a new order for the authenticated user.

    Mirrors: createOrder in orderControllers.js
    POST /api/v1/order/new
    """
    data = await request.json()

    order_items = data.get("orderItems", [])
    if not order_items:
        raise ErrorHandler("No order items provided", 400)

    order = Order(
        shipping_info=data["shippingInfo"],
        user=str(current_user.id),
        order_items=order_items,
        payment_method=data["paymentMethod"],
        payment_info=data.get("paymentInfo"),
        items_price=data["itemsPrice"],
        tax_amount=data["taxAmount"],
        shipping_amount=data["shippingAmount"],
        total_amount=data["totalAmount"],
        paid_at=datetime.now(timezone.utc),
    )
    await order.insert()

    return JSONResponse({"success": True, "order": _serialize_order(order)}, status_code=201)


async def get_order_details(order_id: str) -> JSONResponse:
    """Return a single order with user name and email populated.

    Mirrors: getOrderDetails in orderControllers.js
    GET /api/v1/order/getdetails/{id}
    """
    order = await _get_order_or_404(order_id)
    user = await User.get(order.user)

    serialized = _serialize_order(order)
    if user:
        serialized["user"] = {"name": user.name, "email": user.email}

    return JSONResponse({"success": True, "order": serialized})


async def get_all_orders_of_current_user(current_user: User) -> JSONResponse:
    """Return all orders belonging to the current user.

    Mirrors: getAllOrdersOfCurrentUser in orderControllers.js
    GET /api/v1/order/all/me
    """
    orders = await Order.find(Order.user == str(current_user.id)).to_list()
    return JSONResponse({"success": True, "orders": [_serialize_order(o) for o in orders]})


async def get_all_orders() -> JSONResponse:
    """Return all orders across all users (admin only).

    Mirrors: getAllOrders in orderControllers.js
    GET /api/v1/admin/order
    """
    orders = await Order.find_all().to_list()
    total_amount = sum(o.total_amount for o in orders)
    return JSONResponse({
        "success": True,
        "totalAmount": total_amount,
        "orders": [_serialize_order(o) for o in orders],
    })


async def update_order(order_id: str, request: Request) -> JSONResponse:
    """Update order status; decrement stock on Shipped; set deliveredAt on Delivered.

    Mirrors: updateOrder in orderControllers.js
    PUT /api/v1/admin/order/update/{id}
    """
    order = await _get_order_or_404(order_id)

    if order.order_status == "Delivered":
        raise ErrorHandler("This order has already been delivered", 400)

    data = await request.json()
    new_status = data.get("orderStatus", order.order_status)

    if new_status == "Shipped":
        for item in order.order_items:
            await _update_stock(item.product, item.quantity)

    update: dict = {"order_status": new_status, "updated_at": datetime.now(timezone.utc)}
    if new_status == "Delivered":
        update["delivered_at"] = datetime.now(timezone.utc)

    await order.set(update)
    order = await Order.get(order_id)
    return JSONResponse({"success": True, "order": _serialize_order(order)})


async def delete_order(order_id: str) -> JSONResponse:
    """Delete an order (admin only).

    Mirrors: deleteOrder in orderControllers.js
    DELETE /api/v1/admin/order/delete/{id}
    """
    order = await _get_order_or_404(order_id)
    await order.delete()
    return JSONResponse({"success": True, "message": "Order deleted"})


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _update_stock(product_id: str, quantity: int) -> None:
    """Decrement product stock — mirrors updateStock() in orderControllers.js."""
    product = await Product.get(product_id)
    if product:
        await product.set({"stock": max(0, product.stock - quantity)})


async def _get_order_or_404(order_id: str) -> Order:
    try:
        order = await Order.get(order_id)
    except Exception:
        order = None
    if not order:
        raise ErrorHandler(f"Order not found with id: {order_id}", 404)
    return order


def _serialize_order(order: Order) -> dict:
    """Convert an Order document to a JSON-serialisable dict."""
    d = order.model_dump()
    d["_id"] = str(order.id)
    d.pop("id", None)
    for key in ("created_at", "updated_at", "paid_at", "delivered_at"):
        if isinstance(d.get(key), datetime):
            d[key] = d[key].isoformat()
    # Convert enum value
    if hasattr(d.get("payment_method"), "value"):
        d["payment_method"] = d["payment_method"].value
    return d
