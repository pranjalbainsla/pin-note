from flask import request, g
from utils.supabase_client import supabase_auth, bind_request_db_auth

public_routes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/logout",
]

def auth_middleware():
    # Allow preflight requests
    if request.method == "OPTIONS":
        return
    # Skip public routes
    if request.path in public_routes:
        return

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return ({"message": "Missing token"}), 401

    token = auth_header.split(" ")[1]

    try:
        response = supabase_auth.auth.get_user(token)

        if not response.user:
            return ({"message": "Invalid token"}), 401

        # attach user to current request
        g.user = response.user
        g.access_token = token
        bind_request_db_auth(token)

    except Exception:
        return ({"message": "Invalid or expired token"}), 401