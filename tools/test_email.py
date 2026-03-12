#!/usr/bin/env python3
"""
test_email.py — The Pet Point
Phase 2 / Link: Email Service Connectivity Test (Resend / SendGrid / SMTP)

Usage:
  1. Copy .env.example to .env and set your EMAIL_* variables.
  2. pip install resend python-dotenv   (for Resend)
     pip install sendgrid python-dotenv (for SendGrid)
     pip install python-dotenv          (for SMTP — smtplib is stdlib)
  3. python tools/test_email.py

The script sends a real test email to ADMIN_EMAIL.
Check your inbox at thepetpoint.ca@gmail.com for confirmation.

Expected output (PASS):
  ✅ Test email sent successfully via resend.
  📬 Message ID: ...
"""

import sys
import os
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)
else:
    print("⚠️  No .env file found. Using system environment variables.")

EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "resend").lower()
EMAIL_API_KEY  = os.getenv("EMAIL_API_KEY", "")
EMAIL_FROM     = os.getenv("EMAIL_FROM", "noreply@thepetpoint.ca")
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL", "thepetpoint.ca@gmail.com")

SUBJECT = "✅ The Pet Point — Email Integration Test"
HTML_BODY = """
<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
  <h2 style="color: #6B4EFF;">🐾 The Pet Point — Email Test</h2>
  <p>This is a connectivity test email sent from the <strong>Phase 2 / Link</strong> test script.</p>
  <p>If you received this, your email service integration is working correctly.</p>
  <hr style="border: none; border-top: 1px solid #E0D9FF; margin: 24px 0;" />
  <p style="color: #777777; font-size: 14px;">Provider: <strong>{provider}</strong><br />
  Sender: <strong>{sender}</strong></p>
</div>
""".format(provider=EMAIL_PROVIDER, sender=EMAIL_FROM)

print(f"📧 Testing email via provider: {EMAIL_PROVIDER.upper()}")
print(f"   From: {EMAIL_FROM}")
print(f"   To:   {ADMIN_EMAIL}")


# ── RESEND ────────────────────────────────────────────────────────────────────
if EMAIL_PROVIDER == "resend":
    try:
        import resend
    except ImportError:
        print("❌ resend not installed. Run: pip install resend")
        sys.exit(1)

    if not EMAIL_API_KEY:
        print("❌ EMAIL_API_KEY is not set.")
        sys.exit(1)

    resend.api_key = EMAIL_API_KEY
    try:
        params = {
            "from": EMAIL_FROM,
            "to": [ADMIN_EMAIL],
            "subject": SUBJECT,
            "html": HTML_BODY,
        }
        response = resend.Emails.send(params)
        print(f"\n✅ Test email sent successfully via Resend.")
        print(f"📬 Message ID: {response.get('id', 'N/A')}")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Resend send failed: {e}")
        print("\nTroubleshooting:")
        print("  • Is your EMAIL_API_KEY valid? Check https://resend.com/api-keys")
        print("  • Is EMAIL_FROM a verified sender domain in Resend?")
        sys.exit(1)


# ── SENDGRID ──────────────────────────────────────────────────────────────────
elif EMAIL_PROVIDER == "sendgrid":
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
    except ImportError:
        print("❌ sendgrid not installed. Run: pip install sendgrid")
        sys.exit(1)

    if not EMAIL_API_KEY:
        print("❌ EMAIL_API_KEY is not set.")
        sys.exit(1)

    try:
        message = Mail(
            from_email=EMAIL_FROM,
            to_emails=ADMIN_EMAIL,
            subject=SUBJECT,
            html_content=HTML_BODY,
        )
        sg = SendGridAPIClient(EMAIL_API_KEY)
        response = sg.send(message)
        print(f"\n✅ Test email sent successfully via SendGrid.")
        print(f"📬 Status code: {response.status_code}")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ SendGrid send failed: {e}")
        sys.exit(1)


# ── SMTP ──────────────────────────────────────────────────────────────────────
elif EMAIL_PROVIDER == "smtp":
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASS = os.getenv("SMTP_PASS", "")

    if not SMTP_USER or not SMTP_PASS:
        print("❌ SMTP_USER or SMTP_PASS is not set.")
        sys.exit(1)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = SUBJECT
        msg["From"]    = EMAIL_FROM
        msg["To"]      = ADMIN_EMAIL
        msg.attach(MIMEText(HTML_BODY, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(EMAIL_FROM, ADMIN_EMAIL, msg.as_string())

        print(f"\n✅ Test email sent successfully via SMTP ({SMTP_HOST}:{SMTP_PORT}).")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ SMTP send failed: {e}")
        sys.exit(1)


else:
    print(f"❌ Unknown EMAIL_PROVIDER: '{EMAIL_PROVIDER}'")
    print("   Valid values: resend | sendgrid | smtp")
    sys.exit(1)
