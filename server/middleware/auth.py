from flask import request, g
from utils.supabase_client import supabase

public_routes = ["/api/auth/login", "/api/auth/signup"]

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
        response = supabase.auth.get_user(token)

        if not response.user:
            return ({"message": "Invalid token"}), 401

        # attach user to current request
        g.user = response.user

    except Exception:
        return ({"message": "Invalid or expired token"}), 401