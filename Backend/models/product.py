from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document, Link
from pydantic import BaseModel, Field


class CategoryEnum(str, Enum):
    electronics = "Electronics"
    cameras = "Cameras"
    laptops = "Laptops"
    accessories = "Accessories"
    headphones = "Headphones"
    food = "Food"
    books = "Books"
    sports = "Sports"
    outdoor = "Outdoor"
    home = "Home"
    eco_friendly = "Eco-Friendly"


class ProductImage(BaseModel):
    public_id: Optional[str] = None
    url: str


class Review(BaseModel):
    user: str  # stored as string id to avoid circular Beanie link issues
    rating: float
    comment: str


class Product(Document):
    """Beanie Document mirroring the Mongoose Product schema."""

    name: str = Field(..., max_length=200)
    price: float = Field(...)
    description: str
    ratings: float = Field(default=0)
    images: list[ProductImage] = Field(default_factory=list)
    category: CategoryEnum
    seller: str
    stock: int
    num_of_reviews: int = Field(default=0)
    reviews: list[Review] = Field(default_factory=list)
    user: Optional[str] = None  # id of the admin who created it
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        collection = "products"
