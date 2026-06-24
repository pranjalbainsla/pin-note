from flask import request, Blueprint
from services.auth_service import AuthService
from repositories.user_repository import SupabaseUserRepository
from exceptions import ValidationError

auth_bp = Blueprint("/api/auth", __name__)

# Initialize repository and service
user_repository = SupabaseUserRepository()
auth_service = AuthService(user_repository)


@auth_bp.route("/register", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise ValidationError("Email and password are required")

    result = auth_service.signup(email, password)
    return result, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise ValidationError("Email and password are required")

    result = auth_service.login(email, password)
    return result, 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    data = request.get_json() or {}
    refresh_token = data.get("refresh_token")

    if not refresh_token:
        raise ValidationError("Refresh token is required")

    result = auth_service.refresh(refresh_token)
    return result, 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise ValidationError("Access token is required")

    access_token = auth_header.split(" ")[1]
    result = auth_service.logout(access_token)
    return result, 200
