"""
Schema validation.

Guarantees that every record appended to rto_database.json matches the exact
shape the React app already consumes. No record that fails validation can reach
the dataset.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Tuple

from . import config

_FORBIDDEN = config.VALIDATION["forbidden_substrings"]


def _has_forbidden(text: str) -> bool:
    return any(f in text for f in _FORBIDDEN)


def validate_general_faq(rec: Dict[str, Any]) -> Tuple[bool, str]:
    if not isinstance(rec, dict):
        return False, "not an object"
    for key in ("category", "question", "answer"):
        if key not in rec:
            return False, f"missing key '{key}'"
    category, question, answer = rec["category"], rec["question"], rec["answer"]
    if not isinstance(category, str) or not category.strip():
        return False, "category not a non-empty string"
    if not isinstance(question, str):
        return False, "question not a string"
    if not isinstance(answer, str):
        return False, "answer not a string"

    v = config.VALIDATION["general_faq"]
    q = question.strip()
    a = answer.strip()
    if not (v["min_question_len"] <= len(q) <= v["max_question_len"]):
        return False, f"question length {len(q)} out of range"
    if len(a) < v["min_answer_len"]:
        return False, f"answer too short ({len(a)} < {v['min_answer_len']})"
    if len(a) > v["max_answer_len"]:
        return False, f"answer too long ({len(a)} > {v['max_answer_len']})"
    if _has_forbidden(q) or _has_forbidden(a):
        return False, "contains residual markup"
    return True, ""


def validate_services(rec: Dict[str, Any]) -> Tuple[bool, str]:
    """Full nested schema check (used when a source yields service records)."""
    if not isinstance(rec, dict):
        return False, "not an object"
    v = config.VALIDATION["services"]
    for key in v["required_top_keys"]:
        if key not in rec:
            return False, f"missing top-level key '{key}'"
    sv = rec.get("state_variations") or {}
    for st in v["required_states"]:
        if st not in sv:
            return False, f"state_variations missing '{st}'"
        for fld in ("state_name", "contactless", "fee_breakdown", "test_format", "special_note"):
            if fld not in sv[st]:
                return False, f"state_variations.{st} missing '{fld}'"
    ar = rec.get("applicant_requirements") or {}
    for at in v["required_applicant_types"]:
        if at not in ar:
            return False, f"applicant_requirements missing '{at}'"
    for text_field in ("description", "prerequisites"):
        if not isinstance(rec.get(text_field), str) or _has_forbidden(rec[text_field]):
            return False, f"invalid '{text_field}'"
    if not isinstance(rec.get("common_steps"), list) or not rec["common_steps"]:
        return False, "common_steps must be a non-empty list"
    if not isinstance(rec.get("faqs"), list):
        return False, "faqs must be a list"
    return True, ""


def validate(collection: str, rec: Dict[str, Any]) -> Tuple[bool, str]:
    if collection == "general_faqs":
        return validate_general_faq(rec)
    if collection == "services":
        return validate_services(rec)
    return False, f"unknown collection '{collection}'"
