class AppError(Exception):
    """Base for all app errors. Carries an HTTP status code."""
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code

class InvalidCredentialsError(AppError):
    def __init__(self, message="Invalid email or password"):
        super().__init__(message, status_code=401)

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, status_code=400)