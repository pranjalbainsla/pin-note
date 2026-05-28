from repositories.user_repository import IUserRepository


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
        # Validation
        if not email or not password:
            raise ValueError("Email and password are required")
        
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")
        #check if user already exists
        existing_user = self.user_repo.get_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Delegate to repository (which handles Supabase auth)
        user, token = self.user_repo.create_user_with_auth(email, password)
        
        return {
            "user": user.to_dict(),
            "token": token
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
        
        
        # Delegate to repository (which handles Supabase auth)
        user, token = self.user_repo.authenticate_user(email, password)
        
        return {
            "user": user.to_dict(),
            "token": token
        }
