"""
Logging + run statistics for the pipeline.

`Stats` is a single shared counter object mutated by the HTTP client, the
sources, and the orchestrator. It lets us report, at the end of a run:
  - successful / failed HTTP requests
  - records extracted, validated, skipped (invalid), duplicates, and appended
grouped per source.
"""

from __future__ import annotations

import logging
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List


class Stats:
    """Thread-safe run statistics accumulator."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.requests_total = 0
        self.requests_success = 0
        self.requests_failed = 0
        # per-source tallies
        self.by_source: Dict[str, Dict[str, int]] = {}

    def _src(self, name: str) -> Dict[str, int]:
        if name not in self.by_source:
            self.by_source[name] = {
                "extracted": 0, "invalid": 0, "skipped": 0,
                "duplicate": 0, "added": 0,
            }
        return self.by_source[name]

    def req_ok(self) -> None:
        with self._lock:
            self.requests_total += 1
            self.requests_success += 1

    def req_fail(self) -> None:
        with self._lock:
            self.requests_total += 1
            self.requests_failed += 1

    def inc(self, source: str, key: str, n: int = 1) -> None:
        with self._lock:
            self._src(source)[key] += n

    @property
    def total_added(self) -> int:
        return sum(s["added"] for s in self.by_source.values())

    def summary_lines(self) -> List[str]:
        lines = []
        lines.append(f"HTTP requests : {self.requests_total} "
                     f"(success={self.requests_success}, failed={self.requests_failed})")
        lines.append("Per-source record flow:")
        for name, s in self.by_source.items():
            lines.append(
                f"  - {name}: extracted={s['extracted']} "
                f"invalid={s['invalid']} skipped={s['skipped']} "
                f"duplicate={s['duplicate']} added={s['added']}"
            )
        lines.append(f"TOTAL newly collected records: {self.total_added}")
        return lines


def setup_logging(log_dir: Path, level: int = logging.INFO) -> logging.Logger:
    """Configure root logger -> console + timestamped file under log_dir."""
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"run_{datetime.now():%Y%m%d_%H%M%S}.log"

    logger = logging.getLogger("rto_scraper")
    logger.setLevel(level)
    logger.handlers.clear()
    logger.propagate = False

    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-7s | %(message)s", "%Y-%m-%d %H:%M:%S"
    )

    console = logging.StreamHandler()
    console.setFormatter(fmt)
    logger.addHandler(console)

    fileh = logging.FileHandler(log_file, encoding="utf-8")
    fileh.setFormatter(fmt)
    logger.addHandler(fileh)

    logger.info("Logging to %s", log_file)
    return logger
