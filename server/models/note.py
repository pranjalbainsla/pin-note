class Note:
    def __init__(
        self,
        id: str,
        user_id: str,
        title: str,
        content: str,
        updated_at: str | None = None,
    ):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.content = content
        self.updated_at = updated_at

    def to_dict(self):
        """Return note data"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content,
            "updated_at": self.updated_at,
        }