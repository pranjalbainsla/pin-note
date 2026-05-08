from abc import ABC, abstractmethod
from utils.supabase_client import supabase
from models.note import Note


class INotesRepository(ABC):
    """Repository interface - defines contract for notes data access"""
    @abstractmethod
    def get_notes_by_user_id(self, user_id: str) -> list[Note]:
        """Get all notes for a user."""
        pass
    def create_note(self, user_id: str, title: str, content: str) -> Note:
        """Create a new note."""
        pass

    @abstractmethod
    def update_note(self, note_id: str, user_id: str, title: str, content: str) -> None:
        """Update a note."""
        pass
        

class SupabaseNotesRepository(INotesRepository):
    def get_notes_by_user_id(self, user_id: str) -> list[Note]:

        response = (
            supabase.table("notes")
            .select("*")
            .eq("user_id", user_id)
            .neq("title", "")
            .order("updated_at", desc=True)
            .execute()
        )
        if not response.data:
            raise Exception("Failed to fetch notes")
        
        notes = []

        for note_data in response.data:
            notes.append(
                Note(
                    id=note_data["id"],
                    user_id=note_data["user_id"],
                    title=note_data["title"],
                    content=note_data["content"]
                )
            )

        return notes
    
    def get_note_by_id(self, note_id: str) -> Note:

        response = (
            supabase.table("notes")
            .select("*")
            .eq("id", note_id)
            .execute()
        )
        if not response.data:
            raise Exception("Failed to fetch note")
        
        note_data = response.data[0]

        return Note(
            id=note_data["id"],
            user_id=note_data["user_id"],
            title=note_data["title"],
            content=note_data["content"]
        )
    
    
    def create_note(self, user_id: str, title: str, content: str) -> Note:

        response = (
            supabase.table("notes")
            .insert({
                "user_id": user_id,
                "title": title,
                "content": content
            })
            .execute()
        )

        if not response.data:
            raise Exception("Failed to create note")

        note_data = response.data[0]

        return Note(
            id=note_data["id"],
            user_id=note_data["user_id"],
            title=note_data["title"],
            content=note_data["content"]
        )
    
    def update_note(self, note_id: str, user_id: str, title: str, content: str) -> None:

        response = (
            supabase.table("notes")
            .update({
                "title": title,
                "content": content
            })
            .eq("id", note_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise Exception("Failed to update note")