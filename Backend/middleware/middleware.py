import os

from fastapi import Request
from fastapi.responses import JSONResponse

from Backend.utils.errorHandler import ErrorHandler


def build_error_response(status_code: int, message: str, request: Request) -> JSONResponse:
    """Return a JSON error matching the original Express error format."""
    node_env = os.getenv("NODE_ENV", "DEVELOPMENT")
    body: dict = {"success": False, "message": message}

    # In development, expose additional detail in the response
    if node_env == "DEVELOPMENT":
        body["error"] = message

    return JSONResponse(status_code=status_code, content=body)


async def error_handler(request: Request, exc: ErrorHandler) -> JSONResponse:
    """Handle ErrorHandler exceptions — mirrors the Express error middleware."""
    return build_error_response(exc.status_code, exc.message, request)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — returns 500."""
    return build_error_response(500, "Internal Server Error", request)
