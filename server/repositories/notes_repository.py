from abc import ABC, abstractmethod
from postgrest.exceptions import APIError
from utils.supabase_client import supabase_db
from models.note import Note
from models.note_version import NoteVersion
from exceptions import NotFoundError

MIN_FONT_SIZE_PX = 14
MAX_FONT_SIZE_PX = 28
DEFAULT_FONT_SIZE_PX = 18
VERSION_LIST_LIMIT = 50


def clamp_font_size_px(size: int) -> int:
    return max(MIN_FONT_SIZE_PX, min(MAX_FONT_SIZE_PX, size))


def _note_from_row(note_data: dict) -> Note:
    return Note(
        id=note_data["id"],
        user_id=note_data["user_id"],
        title=note_data["title"],
        content=note_data["content"],
        font_size_px=note_data.get("font_size_px", DEFAULT_FONT_SIZE_PX),
        updated_at=note_data.get("updated_at"),
    )


def _first_rpc_row(data: list | dict | None) -> dict | None:
    """PostgREST returns a dict for scalar composite RPC results, a list for setof."""
    if not data:
        return None
    if isinstance(data, dict):
        return data
    if isinstance(data, list) and data:
        return data[0]
    return None


def _version_from_row(version_data: dict) -> NoteVersion:
    return NoteVersion(
        id=version_data["id"],
        note_id=version_data["note_id"],
        user_id=version_data["user_id"],
        title=version_data["title"],
        content=version_data["content"],
        font_size_px=version_data.get("font_size_px", DEFAULT_FONT_SIZE_PX),
        content_hash=version_data["content_hash"],
        source=version_data["source"],
        created_at=version_data.get("created_at"),
    )


def _raise_not_found_from_rpc(error: APIError) -> None:
    message = str(error)
    details = getattr(error, "details", "") or ""
    combined = f"{message} {details}"
    if "Note not found" in combined or "Version not found" in combined:
        raise NotFoundError(combined.strip()) from error
    raise error


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

    @abstractmethod
    def list_versions(self, note_id: str, user_id: str) -> list[NoteVersion]:
        """List versions for a note."""
        pass

    @abstractmethod
    def get_version(self, note_id: str, version_id: str, user_id: str) -> NoteVersion:
        """Get a single note version."""
        pass

    @abstractmethod
    def restore_version(self, note_id: str, version_id: str, user_id: str) -> Note:
        """Restore a note from a version."""
        pass


class SupabaseNotesRepository(INotesRepository):
    def get_notes_by_user_id(self, user_id: str) -> list[Note]:
        response = (
            supabase_db.table("notes")
            .select("id, user_id, title, content, font_size_px, updated_at")
            .eq("user_id", user_id)
            .neq("title", "")
            .order("updated_at", desc=True)
            .execute()
        )
        # TODO: convert low level database exceptions into an AppError
        return [_note_from_row(note_data) for note_data in response.data]

    def get_note_by_id(self, note_id: str) -> Note:
        response = (
            supabase_db.table("notes")
            .select("id, user_id, title, content, font_size_px, updated_at")
            .eq("id", note_id)
            .execute()
        )

        if not response.data:
            raise NotFoundError("Note not found")

        return _note_from_row(response.data[0])

    def create_note(
        self,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int = DEFAULT_FONT_SIZE_PX,
    ) -> Note:
        try:
            response = supabase_db.rpc(
                "create_note_with_version",
                {
                    "p_user_id": user_id,
                    "p_title": title,
                    "p_content": content,
                    "p_font_size_px": clamp_font_size_px(font_size_px),
                    "p_source": "autosave",
                },
            ).execute()
        except APIError as error:
            _raise_not_found_from_rpc(error)

        if not response.data:
            raise NotFoundError("Note not found")

        note_data = _first_rpc_row(response.data)
        if not note_data:
            raise NotFoundError("Note not found")

        return _note_from_row(note_data)

    def update_note(
        self,
        note_id: str,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int,
    ) -> None:
        try:
            supabase_db.rpc(
                "update_note_with_version",
                {
                    "p_note_id": note_id,
                    "p_user_id": user_id,
                    "p_title": title,
                    "p_content": content,
                    "p_font_size_px": clamp_font_size_px(font_size_px),
                    "p_source": "autosave",
                },
            ).execute()
        except APIError as error:
            _raise_not_found_from_rpc(error)

    def list_versions(self, note_id: str, user_id: str) -> list[NoteVersion]:
        response = (
            supabase_db.table("note_versions")
            .select(
                "id, note_id, user_id, title, content, font_size_px, "
                "content_hash, source, created_at"
            )
            .eq("note_id", note_id)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(VERSION_LIST_LIMIT)
            .execute()
        )

        return [_version_from_row(version_data) for version_data in response.data]

    def get_version(self, note_id: str, version_id: str, user_id: str) -> NoteVersion:
        response = (
            supabase_db.table("note_versions")
            .select(
                "id, note_id, user_id, title, content, font_size_px, "
                "content_hash, source, created_at"
            )
            .eq("id", version_id)
            .eq("note_id", note_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise NotFoundError("Version not found")

        return _version_from_row(response.data[0])

    def restore_version(self, note_id: str, version_id: str, user_id: str) -> Note:
        try:
            response = supabase_db.rpc(
                "restore_note_version",
                {
                    "p_note_id": note_id,
                    "p_version_id": version_id,
                    "p_user_id": user_id,
                },
            ).execute()
        except APIError as error:
            _raise_not_found_from_rpc(error)

        if not response.data:
            raise NotFoundError("Note not found")

        note_data = _first_rpc_row(response.data)
        if not note_data:
            raise NotFoundError("Note not found")

        return _note_from_row(note_data)
