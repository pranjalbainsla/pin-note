import re


def is_note_empty(title: str, content: str) -> bool:
    stripped = re.sub(r"<[^>]*>", "", content).strip()
    return title.strip() == "" and stripped == ""
