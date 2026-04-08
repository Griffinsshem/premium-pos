import os

class Config:
    # =========================
    # DATABASE
    # =========================
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://premium_user:StrongPassword123@localhost/premium_pos"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # =========================
    # JWT
    # =========================
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key")

    # =========================
    # M-PESA DARAJA CONFIG
    # =========================
    MPESA_ENV = os.getenv("MPESA_ENV", "sandbox")

    MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "")
    MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "")

    MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379") 
    MPESA_PASSKEY = os.getenv("MPESA_PASSKEY", "")

    MPESA_CALLBACK_URL = "https://francisco-gritless-minian.ngrok-free.dev/mpesa/callback"

    MPESA_BASE_URL = (
        "https://sandbox.safaricom.co.ke"
        if MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke"
    )