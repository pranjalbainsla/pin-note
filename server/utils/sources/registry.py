from exceptions import ValidationError
from utils.sources.base import SourceHandler
from utils.sources.youtube import YouTubeSourceHandler

_HANDLERS: list[SourceHandler] = [
    YouTubeSourceHandler(),
]


def get_handler_for_url(url: str) -> SourceHandler:
    for handler in _HANDLERS:
        if handler.can_handle(url):
            return handler

    raise ValidationError("Unsupported URL")
