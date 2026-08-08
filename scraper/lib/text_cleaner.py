"""
Text normalization & cleaning utilities.

Scraped content (especially Wikipedia plaintext extracts) arrives with
leftover markup, reference markers, and uneven whitespace. This module turns it
into clean, sentence-bounded, schema-friendly strings and splits a full article
extract into (heading, body) sections so sources can map them to FAQ records.
"""

from __future__ import annotations

import html
import re
from typing import List, Tuple

_HEADING_RE = re.compile(r"^(={2,4})\s*(.+?)\s*\1\s*$", re.MULTILINE)
_REF_MARKER_RE = re.compile(r"\[\d+(?:\s*[,\s]\s*\d+)*\]")          # [1], [2, 3]
_BRACKET_LETTER_RE = re.compile(r"\[[a-z]\]", re.IGNORECASE)        # [a]
_TEMPLATE_RE = re.compile(r"\{\{.*?\}\}", re.DOTALL)               # {{...}}
_WIKILINK_RE = re.compile(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]")       # [[a|b]] / [[a]]
_STYLE_RE = re.compile(r"''+")                                      # ''italic''/bold
_WS_RE = re.compile(r"\s+")
_SENT_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


def clean_text(text: str) -> str:
    """Remove residual markup and normalize whitespace from free text."""
    if not text:
        return ""
    text = html.unescape(text)
    text = _TEMPLATE_RE.sub("", text)
    # strip <ref>...</ref> and stray HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    text = _WIKILINK_RE.sub(r"\1", text)
    text = _REF_MARKER_RE.sub("", text)
    text = _BRACKET_LETTER_RE.sub("", text)
    text = _STYLE_RE.sub("", text)
    text = text.replace("{", "").replace("}", "")
    text = _WS_RE.sub(" ", text)
    # tidy spacing around punctuation
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = text.strip()
    return text


def split_sections(extract: str) -> List[Tuple[str, str]]:
    """
    Split a Wikipedia plaintext extract into (heading, body) tuples.

    The first tuple uses heading="" for the article lead/intro (text before
    the first section heading).
    """
    if not extract:
        return []
    matches = list(_HEADING_RE.finditer(extract))
    sections: List[Tuple[str, str]] = []
    if not matches:
        return [("", clean_text(extract))]

    # lead section (before first heading)
    lead = extract[: matches[0].start()]
    lead = clean_text(lead)
    if lead:
        sections.append(("", lead))

    for i, m in enumerate(matches):
        heading = clean_text(m.group(2))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(extract)
        body = clean_text(extract[start:end])
        if body:
            sections.append((heading, body))
    return sections


def truncate_sentences(text: str, max_len: int) -> str:
    """Truncate to <= max_len characters, keeping whole sentences where possible."""
    text = text.strip()
    if len(text) <= max_len:
        return _ensure_period(text)
    sentences = _SENT_SPLIT_RE.split(text)
    out = ""
    for s in sentences:
        candidate = (out + " " + s).strip()
        if len(candidate) > max_len and out:
            break
        out = candidate
    if not out:
        out = text[:max_len].rsplit(" ", 1)[0]
    return _ensure_period(out)


def build_question(heading: str, topic: str) -> str:
    """Turn a section heading into a natural citizen-style question."""
    h = heading.strip().lower()
    if not h:
        return f"What is {topic} in India?".capitalize()
    return f"What should I know about {h} for {topic} in India?".capitalize()


def _ensure_period(text: str) -> str:
    text = text.strip()
    if text and text[-1] not in ".!?":
        text += "."
    return text
