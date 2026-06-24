from abc import ABC, abstractmethod

import httpx

from config import Config
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
            Tuple of (User, access_token, refresh_token)

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
            Tuple of (User, access_token, refresh_token)

        Raises:
            InvalidCredentialsError: If credentials are invalid
        """
        pass

    @abstractmethod
    def refresh_session(self, refresh_token: str) -> tuple:
        """Exchange a refresh token for a new access/refresh token pair."""
        pass

    @abstractmethod
    def revoke_session(self, access_token: str) -> None:
        """Invalidate the current session server-side."""
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
        session = response.session
        access_token = session.access_token if session else None
        refresh_token = session.refresh_token if session else None

        return user, access_token, refresh_token

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
        session = response.session
        access_token = session.access_token
        refresh_token = session.refresh_token
        return user, access_token, refresh_token

    def refresh_session(self, refresh_token: str) -> tuple:
        """Exchange a refresh token for a new token pair via Supabase Auth API."""
        url = f"{Config.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token"
        headers = {
            "apikey": Config.SUPABASE_KEY,
            "Content-Type": "application/json",
        }

        try:
            response = httpx.post(
                url,
                headers=headers,
                json={"refresh_token": refresh_token},
                timeout=10.0,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError:
            raise UnauthorizedError("Invalid or expired refresh token")
        except httpx.HTTPError:
            raise UnauthorizedError("Unable to refresh session")

        data = response.json()
        return data["access_token"], data["refresh_token"]

    def revoke_session(self, access_token: str) -> None:
        """Invalidate the current session server-side."""
        url = f"{Config.SUPABASE_URL}/auth/v1/logout"
        headers = {
            "apikey": Config.SUPABASE_KEY,
            "Authorization": f"Bearer {access_token}",
        }

        try:
            httpx.post(url, headers=headers, timeout=10.0)
        except httpx.HTTPError:
            # Client clears local storage regardless.
            pass

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
                .table("profiles")
                .select("id, email")
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
