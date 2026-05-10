from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

def extract_video_id(url: str) -> str:

    parsed_url = urlparse(url)

    if parsed_url.hostname == "youtu.be":
        return parsed_url.path[1:]

    return parse_qs(parsed_url.query)["v"][0]


def get_youtube_transcript(video_id: str) -> str:

    ytt_api = YouTubeTranscriptApi()

    transcript = ytt_api.fetch(video_id)

    return " ".join(
        chunk.text
        for chunk in transcript.snippets
    )