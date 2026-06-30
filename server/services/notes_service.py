from repositories.notes_repository import INotesRepository, DEFAULT_FONT_SIZE_PX
from exceptions import ForbiddenError, ValidationError
from utils.note_content import is_note_empty, plain_text_snippet


class NotesService:
    def __init__(self, notes_repository: INotesRepository):
        self.note_repo = notes_repository

    def create_note(
        self,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int = DEFAULT_FONT_SIZE_PX,
    ):
        """Create a new note for the user"""
        if is_note_empty(title, content):
            raise ValidationError("Note must have a title or content")
        return self.note_repo.create_note(user_id, title, content, font_size_px)

    def get_notes_by_user_id(self, user_id: str):
        """Get all non-empty notes for a user"""
        notes = self.note_repo.get_notes_by_user_id(user_id)
        return [
            note
            for note in notes
            if not is_note_empty(note.title, note.content)
        ]

    def get_note_by_id(self, note_id: str, user_id: str):
        """Get a note by its ID if it belongs to the user"""
        note = self.note_repo.get_note_by_id(note_id)
        if note.user_id != user_id:
            raise ForbiddenError("You do not have access to this note")
        return note

    def update_note(
        self,
        note_id: str,
        user_id: str,
        title: str,
        content: str,
        font_size_px: int,
    ):
        """Update a note for a user"""
        self.get_note_by_id(note_id, user_id)
        if is_note_empty(title, content):
            raise ValidationError("Note must have a title or content")
        return self.note_repo.update_note(
            note_id, user_id, title, content, font_size_px
        )

    def list_note_versions(self, note_id: str, user_id: str):
        """List versions for a note owned by the user"""
        self.get_note_by_id(note_id, user_id)
        versions = self.note_repo.list_versions(note_id, user_id)
        return [
            version.to_list_dict(plain_text_snippet(version.content))
            for version in versions
        ]

    def get_note_version(self, note_id: str, version_id: str, user_id: str):
        """Get a single version if the note belongs to the user"""
        self.get_note_by_id(note_id, user_id)
        version = self.note_repo.get_version(note_id, version_id, user_id)
        return version.to_dict()

    def restore_note_version(self, note_id: str, version_id: str, user_id: str):
        """Restore a note to a previous version"""
        self.get_note_by_id(note_id, user_id)
        return self.note_repo.restore_version(note_id, version_id, user_id)
