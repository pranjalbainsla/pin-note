import base64
import json

from supabase import create_client
from config import Config


def _decode_key_role(key: str | None) -> str:
    if not key:
        return "missing"
    try:
        parts = key.split(".")
        if len(parts) < 2:
            return "not_jwt"
        payload = parts[1] + "=" * (-len(parts[1]) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        return str(data.get("role", "unknown"))
    except Exception:
        return "decode_error"


def _create_supabase_client():
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)


# Database reads/writes only — never call .auth on this client.
supabase_db = _create_supabase_client()

# Auth sign-up, sign-in, and token validation only.
supabase_auth = _create_supabase_client()

# Backward-compatible alias for data access.
supabase = supabase_db

SUPABASE_KEY_ROLE = _decode_key_role(Config.SUPABASE_KEY)


def bind_request_db_auth(access_token: str | None) -> None:
    """Attach the caller JWT to PostgREST when the server uses the anon key."""
    if SUPABASE_KEY_ROLE == "service_role" or not access_token:
        return
    supabase_db.postgrest.auth(access_token)
