import requests

from config import Config
from utils.sources.base import SourceMetadata

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3/videos"


def youtube_thumbnail_fallback(video_id: str) -> str:
    # mqdefault is 16:9; hqdefault is 4:3 and often has baked-in letterboxing.
    return f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"


def _pick_thumbnail(thumbnails: dict) -> str | None:
    for key in ("maxres", "standard", "high", "medium", "default"):
        thumbnail = thumbnails.get(key)
        if thumbnail and thumbnail.get("url"):
            return thumbnail["url"]
    return None


def _extract_short_description(raw: str | None) -> str | None:
    if not raw:
        return None

    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    if not lines:
        return None

    text = lines[0]
    if len(text) > 220:
        return None

    return text


def fetch_video_metadata(video_id: str) -> SourceMetadata:
    api_key = Config.YOUTUBE_API_KEY

    if not api_key:
        return SourceMetadata(thumbnail_url=youtube_thumbnail_fallback(video_id))

    try:
        response = requests.get(
            YOUTUBE_API_BASE,
            params={
                "part": "snippet",
                "id": video_id,
                "key": api_key,
            },
            timeout=10,
        )
        response.raise_for_status()
        items = response.json().get("items", [])
        if not items:
            return SourceMetadata(thumbnail_url=youtube_thumbnail_fallback(video_id))

        snippet = items[0].get("snippet", {})
        thumbnails = snippet.get("thumbnails", {})

        return SourceMetadata(
            thumbnail_url=_pick_thumbnail(thumbnails)
            or youtube_thumbnail_fallback(video_id),
            author=snippet.get("channelTitle"),
            title=snippet.get("title"),
            description=_extract_short_description(snippet.get("description")),
        )
    except (requests.RequestException, ValueError, KeyError):
        return SourceMetadata(thumbnail_url=youtube_thumbnail_fallback(video_id))
