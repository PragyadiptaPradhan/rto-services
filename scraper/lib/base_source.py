"""
Source adapter base class.

A *source* knows how to discover, fetch, and normalize records from one external
origin. Each yielded record carries a reserved `_collection` key
('general_faqs' | 'services') telling the orchestrator where to append it.

Adding a new origin = subclass BaseSource (or reuse WikipediaSource with a new
config block) and register it in config.WIKI_SOURCES / the source registry.
The orchestrator and every engine module stay untouched.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List


class BaseSource:
    #: collection this source primarily feeds; subclasses may yield others too.
    default_collection = "general_faqs"

    def __init__(self, name: str, enabled: bool = True) -> None:
        self.name = name
        self.enabled = enabled

    def collect(self, http, cleaner, stats, log: logging.Logger) -> Iterable[Dict[str, Any]]:
        """
        Yield normalized candidate records.

        Implementations should:
          - honour politeness via the shared `http` client (delays/retries)
          - use `cleaner` for all text normalization
          - bump `stats.inc(self.name, 'extracted')` per candidate produced
          - isolate failures (try/except per page) so one bad page can't abort
            the whole run
        """
        raise NotImplementedError

    # convenience helper shared by subclasses
    @staticmethod
    def _record(collection: str, **fields) -> Dict[str, Any]:
        rec = {"_collection": collection}
        rec.update(fields)
        return rec
