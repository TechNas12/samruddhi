import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Set up basic logging for email utility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fetch SMTP credentials from environment
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SENDER_EMAIL = os.environ.get("SMTP_USERNAME", "")
SENDER_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")



# ── Default HTML Templates ──────────────────────────────────────────────────

DEFAULT_BUYER_TEMPLATE = """<html>
<head></head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #064e3b; text-align: center;">Thank you for your order, {{user_name}}!</h2>
    <p>We've received your order and are currently processing it. Here are the details:</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">Order ID: #{{order_id}}</p>
        <p style="margin: 0; color: #666;">Date: {{order_date}}</p>
    </div>

    <h3 style="color: #064e3b; border-bottom: 2px solid #064e3b; padding-bottom: 5px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        {{items_html}}
        <tr>
            <td style="padding: 10px; font-weight: bold; text-align: right;">Total</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #064e3b; font-size: 1.2em;">₹{{total}}</td>
        </tr>
    </table>

    <h3 style="color: #064e3b; border-bottom: 2px solid #064e3b; padding-bottom: 5px;">Shipping Address</h3>
    <p>{{address_html}}</p>

    <p style="text-align: center; margin-top: 40px; color: #666; font-size: 0.9em;">
        If you have any questions, reply to this email or contact us at {{admin_email}}
    </p>
</body>
</html>"""

DEFAULT_ADMIN_TEMPLATE = """<html>
<head></head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #d97706; text-align: center;">New Order Received!</h2>
    <p><strong>{{user_name}}</strong> just placed an order for <strong>₹{{total}}</strong>.</p>

    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fef3c7;">
        <p style="margin: 0;"><strong>Order ID:</strong> #{{order_id}}</p>
        <p style="margin: 0;"><strong>Customer Email:</strong> {{user_email}}</p>
        <p style="margin: 0;"><strong>Customer Phone:</strong> {{user_phone}}</p>
    </div>

    <h3 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 5px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        {{items_html}}
        <tr>
            <td style="padding: 10px; font-weight: bold; text-align: right;">Total</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #d97706; font-size: 1.2em;">₹{{total}}</td>
        </tr>
    </table>

    <h3 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 5px;">Shipping Instructions</h3>
    <p>{{address_html}}</p>

    <p style="text-align: center; margin-top: 40px;">
        <a href="{{FRONTEND_URL}}/admin/orders" style="background-color: #d97706; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Admin Panel</a>
    </p>
</body>
</html>"""


def _send_email(to_email: str, subject: str, html_body: str):
    """Internal helper to securely connect to Google SMTP and send an email."""
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        logger.warning(f"SMTP credentials not configured. Skipping email to {to_email}.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Samruddhi Organics <{SENDER_EMAIL}>"
    msg["To"] = to_email

    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent email to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")


def _load_template(db, key: str, default: str) -> str:
    """Load an email template from SystemSetting, falling back to default."""
    if db is None:
        return default
    try:
        from models import SystemSetting
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting and setting.value:
            return setting.value
    except Exception as e:
        logger.warning(f"Could not load template '{key}' from DB: {e}")
    return default


def _render_template(template: str, variables: dict) -> str:
    """Replace {{placeholder}} variables in the template."""
    result = template
    for key, value in variables.items():
        result = result.replace("{{" + key + "}}", str(value))
    return result


def send_order_emails(order, user, db=None):
    """
    Sends two separate emails:
    1. A confirmation receipt to the buyer
    2. A new order alert to the admin
    """

    # 1. Generate items list HTML
    items_html = ""
    for item in order.items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.product.name} (x{item.quantity})</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{item.price * item.quantity}</td>
        </tr>
        """

    # 2. Build address HTML from correct model fields
    address = order.address
    address_html = f"{address.full_name}<br>{address.street}<br>{address.city}, {address.state} {address.pincode}<br>Phone: {address.phone}"

    # 3. Common template variables
    variables = {
        "user_name": user.name,
        "user_email": user.email,
        "user_phone": address.phone,
        "order_id": str(order.id),
        "order_date": order.created_at.strftime('%B %d, %Y') if order.created_at else "N/A",
        "items_html": items_html,
        "total": str(order.total),
        "address_html": address_html,
        "admin_email": ADMIN_EMAIL,
        "FRONTEND_URL": FRONTEND_URL,
    }


    # 4. Load templates (from DB if available, else defaults)
    buyer_template = _load_template(db, "email_template_buyer", DEFAULT_BUYER_TEMPLATE)
    admin_template = _load_template(db, "email_template_admin", DEFAULT_ADMIN_TEMPLATE)

    # 5. Render and send
    buyer_subject = f"Order Confirmation: #{order.id} - Samruddhi Organics"
    admin_subject = f"🚨 New Order Alert: #{order.id} (₹{order.total})"

    try:
        _send_email(user.email, buyer_subject, _render_template(buyer_template, variables))
        _send_email(ADMIN_EMAIL, admin_subject, _render_template(admin_template, variables))
    except Exception as e:
        logger.error(f"Failed to process emails for order #{order.id}: {str(e)}")
