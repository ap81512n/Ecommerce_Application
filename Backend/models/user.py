import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from beanie import Document, before_event, Insert, Replace, SaveChanges
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Avatar(BaseModel):
    public_id: Optional[str] = None
    url: Optional[str] = None


class User(Document):
    """Beanie Document mirroring the Mongoose User schema."""

    name: str = Field(..., max_length=50)
    email: str = Field(..., pattern=r"^\S+@\S+\.\S+$")
    password: str = Field(..., min_length=6)
    avatar: Optional[Avatar] = None
    role: str = Field(default="user")
    reset_password_token: Optional[str] = None
    reset_password_expire: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        collection = "users"

    @before_event([Insert, Replace, SaveChanges])
    async def hash_password(self):
        """Hash password before saving if it has changed (plain-text detected)."""
        if self.password and not self.password.startswith("$2"):
            self.password = pwd_context.hash(self.password)
        self.updated_at = datetime.now(timezone.utc)

    def get_jwt_token(self) -> str:
        """Return a signed JWT containing the user's id."""
        return jwt.encode(
            {"id": str(self.id)},
            os.getenv("JWT_SECRET"),
            algorithm="HS256",
        )

    def match_password(self, entered_password: str) -> bool:
        """Return True if entered_password matches the stored hash."""
        return pwd_context.verify(entered_password, self.password)

    def get_reset_password_token(self) -> str:
        """Generate a reset token, store its hash, return the raw token."""
        raw_token = secrets.token_hex(20)
        self.reset_password_token = hashlib.sha256(raw_token.encode()).hexdigest()
        self.reset_password_expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        return raw_token
