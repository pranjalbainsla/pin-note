from google import genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_transcript(transcript: str):

    prompt = f"""
    You are summarizing a YouTube video transcript.

    Return ONLY valid JSON in this exact format:

    {{
      "title": "Concise engaging title",
      "author": "Creator name if identifiable, otherwise null",
      "summary": "A well-written (4-5 lines) flowing summary capturing the essence, key ideas, tone, and important moments of the video."
    }}

    Rules:
    - Do not include markdown.
    - Do not wrap JSON in code fences.
    - Summary should feel natural and engaging, not like bullet points.
    - Preserve the emotional tone and narrative flow of the original video when relevant.
    - Title should sound human-written and compelling, not generic.

    Transcript:
    {transcript[:12000]}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()

    # Remove accidental markdown fences
    text = re.sub(r"```json|```", "", text).strip()

    data = json.loads(text)

    title = data["title"].strip()

    summary = data["summary"].strip()

    return {
        "title": title,
        "summary": summary
    }