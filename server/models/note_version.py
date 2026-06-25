class NoteVersion:
    def __init__(
        self,
        id: str,
        note_id: str,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int,
        content_hash: str,
        source: str,
        created_at: str | None = None,
    ):
        self.id = id
        self.note_id = note_id
        self.user_id = user_id
        self.title = title
        self.content = content
        self.font_size_px = font_size_px
        self.content_hash = content_hash
        self.source = source
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "note_id": self.note_id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content,
            "font_size_px": self.font_size_px,
            "content_hash": self.content_hash,
            "source": self.source,
            "created_at": self.created_at,
        }

    def to_list_dict(self, snippet: str):
        return {
            "id": self.id,
            "note_id": self.note_id,
            "title": self.title,
            "font_size_px": self.font_size_px,
            "source": self.source,
            "created_at": self.created_at,
            "snippet": snippet,
        }
