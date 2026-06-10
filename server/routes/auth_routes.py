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

    result  = auth_service.signup(email, password)
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

    

    
    
