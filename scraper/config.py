"""
Central configuration for the RTO Services data-collection pipeline.

Everything that controls *how* and *what* the pipeline collects lives here so
that new sources can be added or tuned without touching the engine code.

Path resolution is relative to this file so the pipeline works regardless of the
directory it is launched from.
"""

from __future__ import annotations

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent            # .../rto-services/scraper
PROJECT_DIR = BASE_DIR.parent                          # .../rto-services
# Default target: the existing application dataset. Overridable via env var so
# the pipeline can point at a different file during testing.
DATA_PATH = Path(
    os.environ.get(
        "RTO_DATA_PATH",
        str(PROJECT_DIR / "src" / "data" / "rto_database.json"),
    )
)
LOG_DIR = BASE_DIR / "logs"
BACKUP_SUFFIX = ".bak"          # pristine copy kept as <file>.bak
OUTPUT_INDENT = 2               # matches the existing file's 2-space formatting
OUTPUT_ENSURE_ASCII = False     # keep unicode (e.g. rupee sign) as-is

# ---------------------------------------------------------------------------
# HTTP / politeness settings
# ---------------------------------------------------------------------------
HTTP = {
    # Wikipedia (and most public APIs) require a descriptive User-Agent.
    "user_agent": "RTO-Services-DataPipeline/1.0 (educational prototype; +https://github.com/PragyadiptaPradhan/rto-services)",
    "timeout": 20,              # seconds per request
    "max_retries": 3,           # retries on transient errors / 429 / 5xx
    "backoff_base": 1.5,        # base seconds; grows exponentially per retry
    "backoff_max": 30,          # cap on a single backoff wait
    "min_delay": 1.0,           # minimum polite delay between requests (seconds)
    "jitter": 0.5,              # random extra delay [0, jitter) added to min_delay
    "respect_retry_after": True,  # honour HTTP 429/503 Retry-After header
}

# ---------------------------------------------------------------------------
# Validation / normalization thresholds
# ---------------------------------------------------------------------------
VALIDATION = {
    "general_faq": {
        "min_answer_len": 40,
        "max_answer_len": 1500,
        "min_question_len": 10,
        "max_question_len": 300,
    },
    "services": {
        # Full nested schema required before a service record is accepted.
        "required_top_keys": [
            "id", "name", "category", "description",
            "prerequisites", "common_steps", "state_variations",
            "applicant_requirements", "faqs",
        ],
        "required_states": ["DL", "MH", "KA"],
        "required_applicant_types": ["General"],
    },
    # Reject residual wiki/markup leftovers in any scraped free-text field.
    "forbidden_substrings": ["[[", "]]", "{{", "}}", "==", "<ref", "&lt;", "{|"],
    # Near-duplicate answer detection (Jaccard token overlap threshold).
    "dup_answer_overlap": 0.80,
}

# ---------------------------------------------------------------------------
# Source registry
# ---------------------------------------------------------------------------
# Each entry instantiates a WikipediaSource with its own page list + category.
# Add a new dict here (or append to the list) to enable another cluster/topic.
# `enabled` toggles a source without deleting its config.
WIKI_SOURCES = [
    {
        "name": "wikipedia_driving_licence",
        "enabled": True,
        "category": "Driving Licence",
        "topic": "driving licence",
        "max_records": 30,
        "pages": [
            "Driving licence in India",
            "Learner's licence",
            "International Driving Permit",
            "Driving test",
        ],
    },
    {
        "name": "wikipedia_vehicle_registration",
        "enabled": True,
        "category": "Vehicle Registration",
        "topic": "vehicle registration",
        "max_records": 30,
        "pages": [
            "Vehicle registration plates of India",
            "Pollution Under Control",
            "Motor Vehicles Act, 1988",
            "Road transport in India",
        ],
    },
]

# Template source kept disabled by default. See sources/parivahan_source.py for
# how to wire a non-Wikipedia (e.g. official Parivahan) endpoint later.
PARIVAHAN_SOURCE = {
    "name": "parivahan_template",
    "enabled": False,
    "endpoint": "https://example.com/rto/faqs",  # replace with a real endpoint
}

# Section headings that never become FAQ records.
SKIP_HEADINGS = {
    "references", "see also", "external links", "notes", "bibliography",
    "further reading", "footnotes", "citations", "gallery", "navigation",
}
