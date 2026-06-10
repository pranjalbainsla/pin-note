from abc import ABC, abstractmethod
from utils.supabase_client import supabase
from models.user import User
from exceptions import (
    InvalidCredentialsError,
    ValidationError,
    ConflictError,
    UnauthorizedError,
)
from gotrue.errors import AuthApiError
from postgrest.exceptions import APIError


class IUserRepository(ABC):
    """Repository interface - defines contract for user data access"""

    @abstractmethod
    def create_user_with_auth(self, email: str, password: str) -> tuple:
        """
        Create user via auth and return (user, token)

        Returns:
            Tuple of (User, access_token)

        Raises:
            ConflictError: If the email is already registered
            ValidationError: If signup data is invalid
        """
        pass

    @abstractmethod
    def authenticate_user(self, email: str, password: str) -> tuple:
        """
        Authenticate user and return (user, token)

        Returns:
            Tuple of (User, access_token)

        Raises:
            InvalidCredentialsError: If credentials are invalid
        """
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> User:
        """Get user by email. Returns None if not found."""
        pass


class SupabaseUserRepository(IUserRepository):
    """Supabase implementation of UserRepository using Supabase Auth"""

    def create_user_with_auth(self, email: str, password: str) -> tuple:
        """Create user via Supabase auth"""
        try:
            response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
        except AuthApiError as e:
            if e.code == "user_already_exists":
                raise ConflictError("User with this email already exists")
            if e.code in ("weak_password", "validation_failed"):
                raise ValidationError(e.message or "Invalid signup data")
            raise

        if not response.user:
            raise ValidationError("Failed to create user")

        user = User(id=response.user.id, email=response.user.email)
        token = response.session.access_token if response.session else None

        return user, token

    def authenticate_user(self, email: str, password: str) -> tuple:
        """Authenticate user with Supabase auth"""
        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
        except AuthApiError:
            raise InvalidCredentialsError()

        user = User(id=response.user.id, email=response.user.email)
        token = response.session.access_token
        return user, token

    def validate_token(self, token: str) -> User:
        """Validate access token and return authenticated user"""
        try:
            response = supabase.auth.get_user(token)
        except AuthApiError:
            raise UnauthorizedError("Invalid or expired token")

        if not response.user:
            raise UnauthorizedError("Invalid or expired token")

        return User(
            id=response.user.id,
            email=response.user.email
        )

    def get_by_email(self, email: str) -> User:
        """Get user by email from Supabase"""
        try:
            response = (
                supabase
                .table("users")
                .select("*")
                .eq("email", email)
                .single()
                .execute()
            )
        except APIError as e:
            if e.code == "PGRST116":
                return None
            raise

        if not response.data:
            return None

        user_data = response.data
        return User(id=user_data["id"], email=user_data["email"])
