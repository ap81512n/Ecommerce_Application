def reset_password_email_template(user_name: str, reset_url: str) -> str:
    """Return the HTML reset-password email body — mirrors emailTemplates.js."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: #fff;
                  border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }}
    .header {{ background: #333; color: #fff; padding: 24px; text-align: center; }}
    .body {{ padding: 32px; color: #333; }}
    .btn {{ display: inline-block; margin-top: 24px; padding: 14px 28px;
            background: #e44d26; color: #fff; text-decoration: none;
            border-radius: 4px; font-weight: bold; }}
    .footer {{ padding: 16px 32px; font-size: 12px; color: #888; }}
    @media (prefers-color-scheme: dark) {{
      body {{ background: #1a1a1a; }}
      .container {{ background: #2d2d2d; }}
      .body {{ color: #e0e0e0; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>Password Reset Request</h2></div>
    <div class="body">
      <p>Hi <strong>{user_name}</strong>,</p>
      <p>We received a request to reset your EcommerceApp password.
         Click the button below to choose a new password:</p>
      <a class="btn" href="{reset_url}">Reset Password</a>
      <p style="margin-top:24px;">This link expires in <strong>15 minutes</strong>.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; EcommerceApp. This is an automated message — please do not reply.
    </div>
  </div>
</body>
</html>
"""
