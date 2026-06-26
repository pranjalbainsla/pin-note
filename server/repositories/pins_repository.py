from abc import ABC, abstractmethod
from models.pin import Pin
from utils.supabase_client import supabase_db


class IPinsRepository(ABC):
    """Repository interface - defines contract for pins data access"""

    @abstractmethod
    def get_pins_by_user_id(self, user_id: str) -> list[Pin]:
        """Get all pins for a user."""
        pass

    @abstractmethod
    def create_pin(
        self,
        user_id: str,
        source_type: str,
        source_url: str,
        title: str,
        summary: str,
        thumbnail_url: str | None = None,
        author: str | None = None,
        description: str | None = None,
    ) -> Pin:
        """Create a new pin."""
        pass


class SupabasePinsRepository(IPinsRepository):
    def _pin_from_row(self, pin_data: dict) -> Pin:
        return Pin(
            id=pin_data["id"],
            user_id=pin_data["user_id"],
            source_type=pin_data["source_type"],
            source_url=pin_data["source_url"],
            title=pin_data["title"],
            summary=pin_data["summary"],
            thumbnail_url=pin_data.get("thumbnail_url"),
            author=pin_data.get("author"),
            description=pin_data.get("description"),
            created_at=pin_data.get("created_at"),
        )

    def get_pins_by_user_id(self, user_id: str) -> list[Pin]:
        response = (
            supabase_db.table("pins")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        if not response.data:
            return []

        return [self._pin_from_row(pin_data) for pin_data in response.data]

    def create_pin(
        self,
        user_id: str,
        source_type: str,
        source_url: str,
        title: str,
        summary: str,
        thumbnail_url: str | None = None,
        author: str | None = None,
        description: str | None = None,
    ) -> Pin:
        response = (
            supabase_db.table("pins")
            .insert({
                "user_id": user_id,
                "source_type": source_type,
                "source_url": source_url,
                "title": title,
                "summary": summary,
                "thumbnail_url": thumbnail_url,
                "author": author,
                "description": description,
            })
            .execute()
        )
        # TODO: add custom errors for database errors
        pin_data = response.data[0]

        return self._pin_from_row(pin_data)
