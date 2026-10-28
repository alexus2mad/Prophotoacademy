import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("guard", Path(__file__).with_name("validate-staging.py"))
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)

class StagingIsolation(unittest.TestCase):
    def valid(self):
        return {
            "NEXT_PUBLIC_SITE_URL": "https://staging.prophotoacademy.com.ua",
            "NEXT_PUBLIC_ACADEMY_URL": "https://staging.prophotoacademy.com.ua",
            "NEXT_PUBLIC_SUPABASE_URL": f"https://{guard.STAGING_REF}.supabase.co",
            "DATABASE_URL": f"postgresql://prophoto_academy_runtime.{guard.STAGING_REF}:test@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=verify-full",
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "test-public",
            "SUPABASE_SERVICE_ROLE_KEY": "test-server",
            "CRON_SECRET": "test-secret",
            "PAYMENT_MODE": "mock",
            "NOTIFICATION_MODE": "local",
            "NEXT_PUBLIC_SANITY_PROJECT_ID": "p0dn7nmp",
            "SANITY_LEARNING_DATASET": "learning-staging",
            "SANITY_LEARNING_WRITE_TOKEN": "test-staging-cms",
            "DATABASE_PATH": "/srv/prophotoacademy-staging/shared/academy.sqlite",
        }

    def test_valid_isolation(self):
        guard.validate(self.valid())

    def test_production_connections_and_side_effects_rejected(self):
        overrides = {
            "NEXT_PUBLIC_SITE_URL": "https://prophotoacademy.com.ua",
            "NEXT_PUBLIC_SUPABASE_URL": f"https://{guard.PRODUCTION_REF}.supabase.co",
            "DATABASE_URL": f"postgresql://postgres.{guard.STAGING_REF}:test@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=verify-full",
            "PAYMENT_MODE": "wayforpay",
            "NOTIFICATION_MODE": "make",
            "MAKE_WEBHOOK_URL": "https://example.com/hook",
            "RESEND_API_KEY": "test",
            "WAYFORPAY_MERCHANT_SECRET": "test",
            "PS_BOOKING_MANAGEMENT_SECRET": "test",
            "NEXT_PUBLIC_SANITY_PROJECT_ID": "production-project",
            "SANITY_LEARNING_DATASET": "learning",
            "DATABASE_PATH": "/srv/prophotoacademy/shared/academy.sqlite",
        }
        for key, value in overrides.items():
            with self.subTest(key=key), self.assertRaises(ValueError):
                guard.validate({**self.valid(), key: value})

    def test_tls_downgrade_rejected(self):
        env = self.valid()
        env["DATABASE_URL"] = env["DATABASE_URL"].replace("verify-full", "disable")
        with self.assertRaises(ValueError):
            guard.validate(env)

    def test_isolated_invitation_sender_allowed(self):
        guard.validate({**self.valid(),
            "INVITATION_RESEND_API_KEY": "re_staging_test_only",
            "INVITATION_EMAIL_FROM": "ProPhoto Academy Staging <login@mail.prophotoacademy.com.ua>",
        })

    def test_incomplete_or_wrong_invitation_sender_rejected(self):
        variants = [
            {"INVITATION_RESEND_API_KEY": "re_staging_test_only"},
            {"INVITATION_EMAIL_FROM": "ProPhoto Academy Staging <login@mail.prophotoacademy.com.ua>"},
            {"INVITATION_RESEND_API_KEY": "re_staging_test_only", "INVITATION_EMAIL_FROM": "Production <other@example.com>"},
        ]
        for variant in variants:
            with self.subTest(variant=variant), self.assertRaises(ValueError):
                guard.validate({**self.valid(), **variant})

if __name__ == "__main__":
    unittest.main()
