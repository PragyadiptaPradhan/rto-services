"""
Dataset load / backup / append / atomic save.

The single most important guarantee: the existing dataset is NEVER overwritten
in place. We (1) keep a pristine backup and (2) write the expanded file via a
temp file + atomic rename so a crash mid-write cannot corrupt the original.
"""

from __future__ import annotations

import json
import logging
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict

import config


def load(path: Path) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, dict) or "services" not in data or "general_faqs" not in data:
        raise ValueError(f"{path} does not look like an rto_database.json (missing keys)")
    return data


def backup(path: Path, logger: logging.Logger) -> Path:
    """Copy the current file to <file>.bak, preserving the pristine original."""
    bak = path.with_suffix(path.suffix + config.BACKUP_SUFFIX)  # .json.bak
    shutil.copyfile(path, bak)
    logger.info("Backup written: %s", bak)
    return bak


def append_records(data: Dict[str, Any], collection: str, records: list) -> None:
    """Mutates `data` in memory by extending the given collection (no I/O)."""
    if collection not in data:
        data[collection] = []
    data[collection].extend(records)


def save(path: Path, data: Dict[str, Any], logger: logging.Logger) -> None:
    """Atomically write the expanded dataset with the original formatting."""
    tmp = None
    try:
        fd, tmp_name = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
        with open(fd, "w", encoding="utf-8") as fh:
            json.dump(
                data,
                fh,
                indent=config.OUTPUT_INDENT,
                ensure_ascii=config.OUTPUT_ENSURE_ASCII,
            )
            fh.write("\n")
        shutil.move(tmp_name, path)  # atomic on same filesystem
        logger.info("Dataset saved: %s", path)
    except Exception:
        if tmp and Path(tmp).exists():
            Path(tmp).unlink(missing_ok=True)
        raise


def summary(data: Dict[str, Any]) -> str:
    return (
        f"services={len(data.get('services', []))} "
        f"general_faqs={len(data.get('general_faqs', []))}"
    )
