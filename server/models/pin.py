class Pin:
    def __init__(self, id: str, user_id: str, source_type: str, source_url: str, title: str, summary: str):
        self.id = id
        self.user_id = user_id
        self.source_type = source_type
        self.source_url = source_url
        self.title = title
        self.summary = summary

    def to_dict(self):
        """Return pin data"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "title": self.title,
            "summary": self.summary
        }