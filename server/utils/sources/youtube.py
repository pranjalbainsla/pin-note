from urllib.parse import urlparse

from exceptions import ValidationError
from utils.sources.base import SourceHandler, SourceMetadata
from utils.youtube_metadata import fetch_video_metadata
from utils.youtube_transcript import extract_video_id, get_youtube_transcript
from youtube_transcript_api._errors import (
    InvalidVideoId,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)


class YouTubeSourceHandler(SourceHandler):
    source_type = "youtube"

    def can_handle(self, url: str) -> bool:
        parsed = urlparse(url)
        hostname = (parsed.hostname or "").lower()

        if hostname in ("youtu.be", "www.youtu.be"):
            return True

        if hostname in ("youtube.com", "www.youtube.com", "m.youtube.com"):
            return True

        return False

    def _get_video_id(self, url: str) -> str:
        try:
            return extract_video_id(url)
        except (KeyError, IndexError):
            raise ValidationError("Invalid YouTube URL")

    def fetch_metadata(self, url: str) -> SourceMetadata:
        video_id = self._get_video_id(url)
        return fetch_video_metadata(video_id)

    def fetch_content(self, url: str) -> str:
        video_id = self._get_video_id(url)

        try:
            return get_youtube_transcript(video_id)
        except InvalidVideoId:
            raise ValidationError("Invalid YouTube URL")
        except (NoTranscriptFound, TranscriptsDisabled, VideoUnavailable):
            raise ValidationError("Transcript not available for this video")
