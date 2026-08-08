"""
RTO Services data-collection pipeline - orchestrator / CLI entry point.

Run with:
    python -m scraper.pipeline            # from the project root (rto-services/)
    python scraper/pipeline.py            # convenience: auto re-launches as module

What it does (per the project spec):
  1. Loads the EXISTING rto_database.json (unchanged schema).
  2. For each enabled source, fetches public data with politeness/retries.
  3. Normalizes + cleans every record to the existing format.
  4. Validates against the exact schema; drops malformed records.
  5. Deduplicates against existing data and within the run.
  6. Appends only new, validated records (no existing data touched).
  7. Writes the expanded dataset atomically, keeping a pristine backup.

Exit code 0 on success; non-zero on fatal error (e.g. cannot read the dataset).
"""

from __future__ import annotations

import argparse
import logging
import os
import runpy
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

# ---- make `python scraper/pipeline.py` behave like `python -m scraper.pipeline`
if __name__ == "__main__" and __package__ in (None, ""):
    _proj = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, _proj)
    runpy.run_module("scraper.pipeline", run_name="__main__")
    raise SystemExit(0)

# ---- package-relative imports (valid once running as `scraper.pipeline`)
from . import config
from .lib.http_client import HTTPClient
from .lib.logger import Stats, setup_logging
from .lib import text_cleaner as tc
from .lib.validator import validate
from .lib.deduplicator import Deduplicator
from .lib.dataset import load, backup, append_records, save, summary
from .sources.wikipedia_source import WikipediaSource
from .sources.parivahan_source import ParivahanSource


def build_sources() -> List:
    sources = []
    for cfg in config.WIKI_SOURCES:
        if not cfg.get("enabled", True):
            continue
        sources.append(WikipediaSource(
            name=cfg["name"],
            category=cfg["category"],
            topic=cfg["topic"],
            pages=list(cfg["pages"]),
            max_records=int(cfg.get("max_records", 30)),
            enabled=True,
        ))
    if config.PARIVAHAN_SOURCE.get("enabled"):
        sources.append(ParivahanSource(
            name=config.PARIVAHAN_SOURCE["name"],
            endpoint=config.PARIVAHAN_SOURCE["endpoint"],
            enabled=True,
        ))
    return sources


def process_candidate(source, cand, dedupe, new_by_coll, stats, log):
    collection = cand.pop("_collection", source.default_collection)
    ok, reason = validate(collection, cand)
    if not ok:
        stats.inc(source.name, "invalid")
        log.debug("[%s] invalid %s: %s", source.name, collection, reason)
        return
    dup, reason = dedupe.is_duplicate(collection, cand)
    if dup:
        stats.inc(source.name, "duplicate")
        log.debug("[%s] duplicate %s: %s", source.name, collection, reason)
        return
    new_by_coll[collection].append(cand)
    stats.inc(source.name, "added")


def main() -> int:
    ap = argparse.ArgumentParser(description="RTO Services data-collection pipeline")
    ap.add_argument("--dry-run", action="store_true",
                    help="run everything but do NOT write the dataset")
    ap.add_argument("--source", default=None,
                    help="only run the source with this name")
    ap.add_argument("--max-records", type=int, default=0,
                    help="global cap on newly collected records (0 = unlimited)")
    ap.add_argument("--no-backup", action="store_true",
                    help="skip writing the .bak pristine copy")
    ap.add_argument("--data-path", default=None,
                    help="override target dataset path")
    ap.add_argument("--log-level", default="INFO",
                    help="DEBUG/INFO/WARNING/ERROR")
    args = ap.parse_args()

    logger = setup_logging(config.LOG_DIR, getattr(logging, args.log_level.upper(), logging.INFO))

    data_path = Path(args.data_path) if args.data_path else config.DATA_PATH
    logger.info("Target dataset: %s", data_path)

    try:
        data = load(data_path)
    except Exception as exc:
        logger.error("FATAL: cannot load dataset: %s", exc)
        return 2
    logger.info("Loaded existing dataset (%s).", summary(data))

    sources = build_sources()
    if args.source:
        sources = [s for s in sources if s.name == args.source]
        if not sources:
            logger.error("No source named '%s' is enabled.", args.source)
            return 2
    logger.info("Enabled sources: %s", ", ".join(s.name for s in sources))

    stats = Stats()
    dedupe = Deduplicator(config.VALIDATION["dup_answer_overlap"])
    dedupe.seed_existing(data)
    http = HTTPClient(stats, config.HTTP, logger)

    new_by_coll: Dict[str, list] = defaultdict(list)

    for source in sources:
        logger.info("=== Source: %s ===", source.name)
        try:
            for cand in source.collect(http, tc, stats, logger):
                process_candidate(source, cand, dedupe, new_by_coll, stats, logger)
                if args.max_records and stats.total_added >= args.max_records:
                    logger.info("Global --max-records (%d) reached; stopping.", args.max_records)
                    break
        except Exception as exc:  # never let one source kill the run
            logger.error("[%s] source aborted: %s", source.name, exc)
            continue

    # ---- report + write -------------------------------------------------
    if args.dry_run:
        logger.info("[DRY-RUN] would append: %s",
                    {k: len(v) for k, v in new_by_coll.items()})
    else:
        if any(new_by_coll.values()):
            if not args.no_backup:
                backup(data_path, logger)
            for coll, recs in new_by_coll.items():
                append_records(data, coll, recs)
            save(data_path, data, logger)
            logger.info("Expanded dataset (%s).", summary(data))
        else:
            logger.info("No new records collected; dataset unchanged.")

    for line in stats.summary_lines():
        logger.info(line)
    print("\n".join(stats.summary_lines()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
