class Pin:
    def __init__(
        self,
        id: str,
        user_id: str,
        source_type: str,
        source_url: str,
        title: str,
        summary: str,
        thumbnail_url: str | None = None,
        author: str | None = None,
        description: str | None = None,
        created_at: str | None = None,
    ):
        self.id = id
        self.user_id = user_id
        self.source_type = source_type
        self.source_url = source_url
        self.title = title
        self.summary = summary
        self.thumbnail_url = thumbnail_url
        self.author = author
        self.description = description
        self.created_at = created_at

    def to_dict(self):
        """Return pin data"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "title": self.title,
            "summary": self.summary,
            "thumbnail_url": self.thumbnail_url,
            "author": self.author,
            "description": self.description,
            "created_at": self.created_at,
        }
