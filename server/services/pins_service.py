from repositories.pins_repository import IPinsRepository
from exceptions import ValidationError
from utils.youtube_transcript import (
    extract_video_id,
    get_youtube_transcript,
)
from utils.gemini_client import summarize_transcript
from youtube_transcript_api._errors import (
    InvalidVideoId,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)


class PinsService:

    def __init__(self, pins_repository: IPinsRepository):
        self.pins_repository = pins_repository

    def get_pins_by_user_id(self, user_id: str):
        return self.pins_repository.get_pins_by_user_id(user_id)

    def create_pin(self, user_id: str, url: str):
        try:
            video_id = extract_video_id(url)
        except (KeyError, IndexError):
            raise ValidationError("Invalid YouTube URL")

        try:
            transcript = get_youtube_transcript(video_id)
        except InvalidVideoId:
            raise ValidationError("Invalid YouTube URL")
        except (NoTranscriptFound, TranscriptsDisabled, VideoUnavailable):
            raise ValidationError("Transcript not available for this video")

        ai_response = summarize_transcript(transcript)

        return self.pins_repository.create_pin(
            user_id=user_id,
            source_type="youtube",
            source_url=url,
            title=ai_response["title"],
            summary=ai_response["summary"],
        )
