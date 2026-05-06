from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class PaymentMethodEnum(str, Enum):
    cod = "COD"
    card = "Card"


class ShippingInfo(BaseModel):
    address: str
    city: str
    phone_no: str
    zip_code: str
    country: str


class OrderItem(BaseModel):
    name: str
    quantity: int
    image: str
    price: str
    product: str  # Product id as string


class PaymentInfo(BaseModel):
    id: Optional[str] = None
    status: Optional[str] = None


class Order(Document):
    """Beanie Document mirroring the Mongoose Order schema."""

    shipping_info: ShippingInfo
    user: str  # User id as string
    order_items: list[OrderItem]
    payment_method: PaymentMethodEnum
    payment_info: Optional[PaymentInfo] = None
    items_price: float
    tax_amount: float
    shipping_amount: float
    total_amount: float
    order_status: str = Field(default="Processing")
    paid_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    delivered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        collection = "orders"
