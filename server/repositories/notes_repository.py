from abc import ABC, abstractmethod
from utils.supabase_client import supabase
from models.note import Note
from exceptions import NotFoundError

MIN_FONT_SIZE_PX = 14
MAX_FONT_SIZE_PX = 28
DEFAULT_FONT_SIZE_PX = 18


def clamp_font_size_px(size: int) -> int:
    return max(MIN_FONT_SIZE_PX, min(MAX_FONT_SIZE_PX, size))


class INotesRepository(ABC):
    """Repository interface - defines contract for notes data access"""

    @abstractmethod
    def get_notes_by_user_id(self, user_id: str) -> list[Note]:
        """Get all notes for a user."""
        pass

    @abstractmethod
    def create_note(
        self,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int = DEFAULT_FONT_SIZE_PX,
    ) -> Note:
        """Create a new note."""
        pass

    @abstractmethod
    def get_note_by_id(self, note_id: str) -> Note:
        """Get a note by its ID."""
        pass

    @abstractmethod
    def update_note(
        self,
        note_id: str,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int,
    ) -> None:
        """Update a note."""
        pass


class SupabaseNotesRepository(INotesRepository):
    def get_notes_by_user_id(self, user_id: str) -> list[Note]:
        response = (
            supabase.table("notes")
            .select("id, user_id, title, content, font_size_px, updated_at")
            .eq("user_id", user_id)
            .neq("title", "")
            .order("updated_at", desc=True)
            .execute()
        )
        # TODO: convert low level database exceptions into an AppError
        return [
            Note(
                id=note_data["id"],
                user_id=note_data["user_id"],
                title=note_data["title"],
                content=note_data["content"],
                font_size_px=note_data.get("font_size_px", DEFAULT_FONT_SIZE_PX),
                updated_at=note_data.get("updated_at"),
            )
            for note_data in response.data
        ]

    def get_note_by_id(self, note_id: str) -> Note:
        response = (
            supabase.table("notes")
            .select("id, user_id, title, content, font_size_px, updated_at")
            .eq("id", note_id)
            .execute()
        )

        if not response.data:
            raise NotFoundError("Note not found")

        note_data = response.data[0]

        return Note(
            id=note_data["id"],
            user_id=note_data["user_id"],
            title=note_data["title"],
            content=note_data["content"],
            font_size_px=note_data.get("font_size_px", DEFAULT_FONT_SIZE_PX),
            updated_at=note_data.get("updated_at"),
        )

    def create_note(
        self,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int = DEFAULT_FONT_SIZE_PX,
    ) -> Note:
        response = (
            supabase.table("notes")
            .insert({
                "user_id": user_id,
                "title": title,
                "content": content,
                "font_size_px": clamp_font_size_px(font_size_px),
            })
            .execute()
        )

        note_data = response.data[0]

        return Note(
            id=note_data["id"],
            user_id=note_data["user_id"],
            title=note_data["title"],
            content=note_data["content"],
            font_size_px=note_data.get("font_size_px", DEFAULT_FONT_SIZE_PX),
            updated_at=note_data.get("updated_at"),
        )

    def update_note(
        self,
        note_id: str,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int,
    ) -> None:
        response = (
            supabase.table("notes")
            .update({
                "title": title,
                "content": content,
                "font_size_px": clamp_font_size_px(font_size_px),
            })
            .eq("id", note_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise NotFoundError("Note not found")
