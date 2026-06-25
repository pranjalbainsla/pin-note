import re

_HTML_TAG_RE = re.compile(r"<[^>]*>")
_WHITESPACE_RE = re.compile(r"\s+")


def _strip_html(content: str) -> str:
    return _HTML_TAG_RE.sub("", content)


def is_note_empty(title: str, content: str) -> bool:
    stripped = _strip_html(content).strip()
    return title.strip() == "" and stripped == ""


def plain_text_snippet(content: str, max_len: int = 120) -> str:
    text = _WHITESPACE_RE.sub(" ", _strip_html(content)).strip()
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"
