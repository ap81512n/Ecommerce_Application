import os

import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


async def send_email(options: dict) -> None:
    """Send an HTML email via SMTP — mirrors the Node.js sendEmail utility.

    options keys: email, subject, message (HTML string)
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.mailtrap.io")
    smtp_port = int(os.getenv("SMTP_PORT", 2525))
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_name = os.getenv("SMTP_FROM_NAME", "EcommerceApp")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_email)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = options["subject"]
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = options["email"]
    msg.attach(MIMEText(options["message"], "html"))

    await aiosmtplib.send(
        msg,
        hostname=smtp_host,
        port=smtp_port,
        username=smtp_email,
        password=smtp_password,
    )
