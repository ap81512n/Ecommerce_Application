import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment before anything else — mirrors dotenv.config() in app.js
load_dotenv("Backend/config/config.env")

from Backend.config.dbConnect import connect_database
from Backend.middleware.middleware import error_handler, generic_exception_handler
from Backend.routes.auth import router as auth_router
from Backend.routes.order import router as order_router
from Backend.routes.productreview import router as review_router
from Backend.routes.products import router as products_router
from Backend.utils.errorHandler import ErrorHandler

app = FastAPI(
    title="EcommerceApp API",
    description="FastAPI backend — drop-in replacement for the original Node.js/Express backend.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the React dev server to call this API
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers — mirrors the Express error middleware
app.add_exception_handler(ErrorHandler, error_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB on server start — mirrors connectDatabase() in app.js."""
    await connect_database()


# Mount all route groups — mirrors app.use('/api/v1', router) calls
app.include_router(products_router)
app.include_router(auth_router)
app.include_router(order_router)
app.include_router(review_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """GET /health — liveness probe."""
    return {"status": "ok"}
