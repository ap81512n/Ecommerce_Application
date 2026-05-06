import os

import motor.motor_asyncio
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv("Backend/config/config.env")


async def connect_database():
    """Initialize Motor client and Beanie ODM — mirrors dbConnect.js."""
    node_env = os.getenv("NODE_ENV", "DEVELOPMENT")
    if node_env == "PRODUCTION":
        db_uri = os.getenv("DB_URI")
    else:
        db_uri = os.getenv("DB_LOCAL_URI")

    if not db_uri:
        raise RuntimeError(
            f"No database URI found for NODE_ENV={node_env}. "
            "Check DB_LOCAL_URI or DB_URI in config.env."
        )

    # Import models here to avoid circular imports at module level
    from Backend.models.order import Order
    from Backend.models.product import Product
    from Backend.models.user import User

    client = motor.motor_asyncio.AsyncIOMotorClient(db_uri)
    db_name = db_uri.split("/")[-1].split("?")[0] or "ecommerceapp"
    database = client[db_name]

    await init_beanie(database=database, document_models=[User, Product, Order])
    print(f"MongoDB connected: {client.host}")
