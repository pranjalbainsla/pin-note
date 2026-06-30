class Note:
    def __init__(
        self,
        id: str,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int = 18,
        font_family: str = "newsreader",
        updated_at: str | None = None,
    ):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.content = content
        self.font_size_px = font_size_px
        self.font_family = font_family
        self.updated_at = updated_at

    def to_dict(self):
        """Return note data"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content,
            "font_size_px": self.font_size_px,
            "font_family": self.font_family,
            "updated_at": self.updated_at,
        }
