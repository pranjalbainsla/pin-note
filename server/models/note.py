class Note:
    def __init__(self, id: str, user_id: str, title: str, content: str):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.content = content

    def to_dict(self):
        """Return note data"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content
        }