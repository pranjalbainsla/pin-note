import re
from repositories.user_repository import IUserRepository
from exceptions import ConflictError, ValidationError


class AuthService:
    """Authentication service - contains business logic, delegates auth to repository"""

    def __init__(self, user_repository: IUserRepository):
        """
        Args:
            user_repository: Instance implementing IUserRepository interface
        """
        self.user_repo = user_repository

    def signup(self, email: str, password: str):
        """
        Register a new user with email and password
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            dict with user and token
            
        Raises:
            ValueError: If validation fails
        """
        
        if len(password) < 6:
            raise ValidationError("Password must be at least 6 characters long")
        #check if user already exists
        existing_user = self.user_repo.get_by_email(email)
        if existing_user:
            raise ConflictError("User with this email already exists")
        
        # Delegate to repository (which handles Supabase auth)
        user, access_token, refresh_token = self.user_repo.create_user_with_auth(email, password)
        
        return {
            "user": user.to_dict(),
            "token": access_token,
            "refresh_token": refresh_token,
        }

    def login(self, email: str, password: str):
        """
        Authenticate user with email and password
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            dict with user and token
            
        Raises:
            ValueError: If credentials are invalid
        """
        # Validation -> check if valid email address
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValidationError("Invalid email format")
        
        # Delegate to repository (which handles Supabase auth)
        user, access_token, refresh_token = self.user_repo.authenticate_user(email, password)
        
        return {
            "user": user.to_dict(),
            "token": access_token,
            "refresh_token": refresh_token,
        }

    def refresh(self, refresh_token: str):
        if not refresh_token:
            raise ValidationError("Refresh token is required")

        access_token, new_refresh_token = self.user_repo.refresh_session(refresh_token)

        return {
            "token": access_token,
            "refresh_token": new_refresh_token,
        }

    def logout(self, access_token: str):
        if not access_token:
            raise ValidationError("Access token is required")

        self.user_repo.revoke_session(access_token)
        return {"message": "Logged out"}
