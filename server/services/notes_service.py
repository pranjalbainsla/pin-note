from repositories.notes_repository import INotesRepository, DEFAULT_FONT_SIZE_PX
from exceptions import ForbiddenError


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
        return self.note_repo.create_note(user_id, title, content, font_size_px)

    def get_notes_by_user_id(self, user_id: str):
        """Get all notes for a user"""
        return self.note_repo.get_notes_by_user_id(user_id)

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
        return self.note_repo.update_note(
            note_id, user_id, title, content, font_size_px
        )
