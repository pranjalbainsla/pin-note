from abc import ABC, abstractmethod
from utils.supabase_client import supabase
from models.user import User


class IUserRepository(ABC):
    """Repository interface - defines contract for user data access"""

    @abstractmethod
    def create_user_with_auth(self, email: str, password: str) -> tuple:
        """
        Create user via auth and return (user, token)
        
        Returns:
            Tuple of (User, access_token)
            
        Raises:
            ValueError: If signup fails
        """
        pass

    @abstractmethod
    def authenticate_user(self, email: str, password: str) -> tuple:
        """
        Authenticate user and return (user, token)
        
        Returns:
            Tuple of (User, access_token)
            
        Raises:
            ValueError: If credentials invalid
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
            
            if not response.user:
                raise ValueError("Failed to create user")
            
            user = User(id=response.user.id, email=response.user.email)
            token = response.session.access_token if response.session else None
            
            return user, token
        except Exception as e:
            print("Error creating user:", e)
            raise ValueError(str(e))

    def authenticate_user(self, email: str, password: str) -> tuple:
        """Authenticate user with Supabase auth"""
        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not response.user or not response.session:
                raise ValueError("Invalid credentials")
            
            user = User(id=response.user.id, email=response.user.email)
            token = response.session.access_token
            
            return user, token
        except Exception as e:
            raise ValueError("Invalid email or password")

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

            if not response.data:
                return None

            user_data = response.data
            return User(id=user_data["id"], email=user_data["email"])
        except Exception:
            return None
