"""
Deduplication.

Two layers:
  1. Exact normalized-key match on (collection + question/category) against
     records already in the dataset AND records added earlier in this run.
  2. Near-duplicate answer detection via Jaccard token overlap, so paraphrased
     repeats of the same fact are skipped instead of bloating the KB.

Seeding with the *existing* dataset (via seed_existing) is what guarantees we
never re-append data that is already present.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Iterable, Set, Tuple

_TOKEN_RE = re.compile(r"[a-z0-9]+")
# words too common to be meaningful for similarity comparison
_STOP = {
    "the", "a", "an", "and", "or", "of", "to", "in", "for", "on", "is", "are",
    "be", "with", "that", "this", "it", "as", "at", "by", "from", "can", "you",
    "your", "what", "how", "india", "indian", "rto",
}


def _norm_key(collection: str, rec: Dict[str, Any]) -> Tuple[str, str]:
    if collection == "general_faqs":
        cat = re.sub(r"\s+", " ", str(rec.get("category", "")).lower().strip())
        q = re.sub(r"\s+", " ", str(rec.get("question", "")).lower().strip())
        return ("faq", f"{cat}|{q}")
    return ("svc", str(rec.get("id", "")).lower().strip())


def _tokens(text: str) -> Set[str]:
    return {w for w in _TOKEN_RE.findall(text.lower()) if w not in _STOP and len(w) > 2}


def _jaccard(a: Set[str], b: Set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


class Deduplicator:
    def __init__(self, dup_overlap: float = 0.80) -> None:
        self.dup_overlap = dup_overlap
        self._keys: Set[Tuple[str, str]] = set()
        self._answer_tokens: list[Set[str]] = []

    def seed_existing(self, data: Dict[str, Any]) -> None:
        for rec in data.get("general_faqs", []) or []:
            self._keys.add(_norm_key("general_faqs", rec))
            self._answer_tokens.append(_tokens(rec.get("answer", "")))
        for rec in data.get("services", []) or []:
            self._keys.add(_norm_key("services", rec))

    def is_duplicate(self, collection: str, rec: Dict[str, Any]) -> Tuple[bool, str]:
        key = _norm_key(collection, rec)
        if key in self._keys:
            return True, "exact key match"

        if collection == "general_faqs":
            toks = _tokens(rec.get("answer", ""))
            for seen in self._answer_tokens:
                if _jaccard(toks, seen) >= self.dup_overlap:
                    return True, "near-duplicate answer"
            self._answer_tokens.append(toks)
        self._keys.add(key)
        return False, ""
