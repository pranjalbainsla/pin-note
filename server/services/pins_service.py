from repositories.pins_repository import IPinsRepository
from utils.gemini_client import summarize_transcript
from utils.sources.registry import get_handler_for_url


class PinsService:

    def __init__(self, pins_repository: IPinsRepository):
        self.pins_repository = pins_repository

    def get_pins_by_user_id(self, user_id: str):
        return self.pins_repository.get_pins_by_user_id(user_id)

    def create_pin(self, user_id: str, url: str):
        handler = get_handler_for_url(url)
        metadata = handler.fetch_metadata(url)
        content = handler.fetch_content(url)
        ai_response = summarize_transcript(content)

        author = metadata.author or ai_response.get("author")
        description = metadata.description or ai_response["description"]

        return self.pins_repository.create_pin(
            user_id=user_id,
            source_type=handler.source_type,
            source_url=url,
            title=ai_response["title"],
            summary=ai_response["summary"],
            thumbnail_url=metadata.thumbnail_url,
            author=author,
            description=description,
        )
