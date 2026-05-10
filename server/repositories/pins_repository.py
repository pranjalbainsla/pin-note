from abc import ABC, abstractmethod
from models.pin import Pin
from utils.supabase_client import supabase


class IPinsRepository(ABC):
    """Repository interface - defines contract for pins data access"""
    @abstractmethod
    def get_pins_by_user_id(self, user_id: str) -> list[Pin]:
        """Get all pins for a user."""
        pass
    @abstractmethod
    def create_pin(self, user_id: str, source_type: str, source_url: str, title: str, summary: str) -> Pin:
        """Create a new pin."""
        pass
        
        
class SupabasePinsRepository(ABC):
    def get_pins_by_user_id(self, user_id: str) -> list[Pin]:

        response = (
            supabase.table("pins")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        if not response.data:
            raise Exception("Failed to fetch pins")
        
        pins = []

        for pin_data in response.data:
            pins.append(
                Pin(
                    id=pin_data["id"],
                    user_id=pin_data["user_id"],
                    source_type=pin_data["source_type"],
                    source_url=pin_data["source_url"],
                    title=pin_data["title"],
                    summary=pin_data["summary"]
                )
            )

        return pins
    
    def create_pin(
        self,
        user_id: str,
        source_type: str,
        source_url: str,
        title: str,
        summary: str
    ) -> Pin:

        response = (
            supabase.table("pins")
            .insert({
                "user_id": user_id,
                "source_type": source_type,
                "source_url": source_url,
                "title": title,
                "summary": summary
            })
            .execute()
        )
        if not response.data:
            raise Exception("Failed to create pin")
        
        pin_data = response.data[0]

        return Pin(
            id=pin_data["id"],
            user_id=pin_data["user_id"],
            source_type=pin_data["source_type"],
            source_url=pin_data["source_url"],
            title=pin_data["title"],
            summary=pin_data["summary"]
        )