from fastapi import HTTPException


class ErrorHandler(HTTPException):
    """Custom exception mirroring the Node.js ErrorHandler class.

    Accepts a human-readable message and an HTTP status code, matching
    the original `new ErrorHandler(message, statusCode)` pattern.
    """

    def __init__(self, message: str, status_code: int):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
