import os
from datetime import datetime, timezone

from fastapi import Response


def send_token(user, status_code: int, response: Response) -> dict:
    """Set a JWT cookie and return the standard auth JSON body.

    Mirrors the Node.js sendToken(user, statusCode, res) utility.
    """
    token = user.get_jwt_token()

    expire_days = int(os.getenv("COOKIE_EXPIRES_TIME", 7))
    # max_age in seconds
    max_age = expire_days * 24 * 60 * 60

    response.set_cookie(
        key="token",
        value=token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
    )

    response.status_code = status_code

    return {"token": token}
