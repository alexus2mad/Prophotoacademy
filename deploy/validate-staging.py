"""Reject staging configuration that can write to production."""
from pathlib import Path
from urllib.parse import urlparse

PRODUCTION_REF = "bydmqmrbfjufsyhlayku"
STAGING_REF = "jxfyofiqhjmiguujrtdd"

def read_env(path):
    result = {}
    for line in Path(path).read_text().splitlines():
        if line.strip() and not line.lstrip().startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            result[key] = value.strip().strip("\"'")
    return result

def validate(env):
    expected = "https://staging.prophotoacademy.com.ua"
    for key in ("NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_ACADEMY_URL"):
        if env.get(key) != expected:
            raise ValueError(f"{key} must use the staging domain")
    if env.get("NEXT_PUBLIC_SUPABASE_URL") != f"https://{STAGING_REF}.supabase.co":
        raise ValueError("Staging Supabase project is required")
    database = urlparse(env.get("DATABASE_URL", ""))
    if database.scheme not in ("postgres", "postgresql") or not database.password:
        raise ValueError("Staging database credentials are missing")
    if STAGING_REF not in ((database.hostname or "") + (database.username or "")):
        raise ValueError("Database must belong to the staging Supabase project")
    if database.username != f"prophoto_academy_runtime.{STAGING_REF}":
        raise ValueError("Staging must use its restricted database role")
    if database.hostname != "aws-0-eu-west-1.pooler.supabase.com" or database.port != 5432:
        raise ValueError("Unexpected staging database endpoint")
    if database.query != "sslmode=verify-full":
        raise ValueError("Staging database requires full TLS verification")
    if any(PRODUCTION_REF in value for value in env.values()):
        raise ValueError("Production Supabase reference found in staging")
    for key in ("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET"):
        if not env.get(key):
            raise ValueError(f"{key} is missing")
    if env.get("PAYMENT_MODE") != "mock":
        raise ValueError("Staging must use mock payments")
    if env.get("NOTIFICATION_MODE") != "local":
        raise ValueError("Staging must use local notifications")
    # Only administrator-requested invitations may use the separate staging sender.
    # Payment/Make notifications remain isolated and cannot use this credential.
    invitation_key = env.get("INVITATION_RESEND_API_KEY", "")
    invitation_sender = env.get("INVITATION_EMAIL_FROM", "")
    if invitation_key or invitation_sender:
        if not invitation_key.startswith("re_"):
            raise ValueError("A separate staging invitation sending key is required")
        if invitation_sender != "ProPhoto Academy Staging <login@mail.prophotoacademy.com.ua>":
            raise ValueError("Staging invitations must use the designated staging sender")
    for key in ("WAYFORPAY_MERCHANT_SECRET", "MAKE_WEBHOOK_URL", "RESEND_API_KEY",
                "PS_BOOKING_MANAGEMENT_SECRET", "ECOSYSTEM_INGEST_TOKEN",
                "MUX_TOKEN_ID", "MUX_TOKEN_SECRET", "SANITY_API_WRITE_TOKEN"):
        if env.get(key):
            raise ValueError(f"{key} must not be configured in staging")
    if env.get("NEXT_PUBLIC_SANITY_PROJECT_ID") != "p0dn7nmp":
        raise ValueError("Staging must use its separate Sanity project")
    if env.get("SANITY_LEARNING_DATASET") != "learning-staging":
        raise ValueError("Staging must use its private learning dataset")
    if not env.get("SANITY_LEARNING_WRITE_TOKEN"):
        raise ValueError("Staging authoring credential is missing")
    if env.get("DATABASE_PATH") != "/srv/prophotoacademy-staging/shared/academy.sqlite":
        raise ValueError("Staging ledger must use its isolated shared directory")

if __name__ == "__main__":
    validate(read_env("/etc/prophotoacademy-staging/runtime.env"))
    print("Staging configuration isolation verified")
