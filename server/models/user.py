class User:
    def __init__(self, id: str, email: str):
        self.id = id
        self.email = email

    def to_dict(self):
        """Return user data"""
        return {
            "id": self.id,
            "email": self.email
        }