from google import genai
from google.genai import types
import os
import json
import re
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError as PydanticValidationError

from exceptions import ValidationError

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class TranscriptSummary(BaseModel):
    title: str
    author: str | None = None
    description: str
    summary: str


def _parse_summary_response(text: str) -> TranscriptSummary:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE)

    try:
        return TranscriptSummary.model_validate_json(cleaned)
    except (PydanticValidationError, json.JSONDecodeError, ValueError):
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise ValidationError("Failed to generate summary. Please try again.")

        try:
            return TranscriptSummary.model_validate_json(match.group(0))
        except (PydanticValidationError, json.JSONDecodeError, ValueError):
            raise ValidationError("Failed to generate summary. Please try again.")


def summarize_transcript(transcript: str):
    prompt = f"""
    You are summarizing a YouTube video transcript.

    Write:
    - title: a concise, engaging, human-sounding title
    - author: the creator name if identifiable from the transcript, otherwise null
    - description: exactly 1-2 short sentences for a pin card preview (under 220 characters total)
    - summary: a well-written 4-5 line flowing summary capturing the essence, key ideas, tone, and important moments

    Rules:
    - description must be self-contained and readable on its own; no cliffhanger ellipses.
    - Summary should feel natural and engaging, not like bullet points.
    - Preserve the emotional tone and narrative flow of the original video when relevant.
    - Title should sound compelling, not generic.

    Transcript:
    {transcript[:12000]}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=TranscriptSummary.model_json_schema(),
        ),
    )

    text = (response.text or "").strip()
    if not text:
        raise ValidationError("Failed to generate summary. Please try again.")

    data = _parse_summary_response(text)

    return {
        "title": data.title.strip(),
        "description": data.description.strip(),
        "summary": data.summary.strip(),
        "author": data.author,
    }
