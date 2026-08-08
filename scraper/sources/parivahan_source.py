"""
Parivahan (official portal) source TEMPLATE -- disabled by default.

This is a scaffold showing how to plug a *second kind* of origin (an official
RTO / Parivahan endpoint, a state transport department page, a JSON open-data
feed, etc.) into the exact same pipeline without rewriting any engine code.

It is intentionally NOT enabled in config.PARIVAHAN_SOURCE["enabled"] = False.
Fill in a real `endpoint`, parse its response into `_record("general_faqs", ...)`
(or `_record("services", ...)`) candidates, and flip `enabled` to True. The
orchestrator will treat it identically to the Wikipedia sources.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Iterable

from ..lib.base_source import BaseSource


class ParivahanSource(BaseSource):
    default_collection = "general_faqs"

    def __init__(self, name: str, endpoint: str, enabled: bool = False) -> None:
        super().__init__(name, enabled)
        self.endpoint = endpoint

    def collect(self, http, cleaner, stats, log: logging.Logger) -> Iterable[Dict[str, Any]]:
        # --- TEMPLATE: replace with the real fetch + parse logic -----------
        # Example shape for a JSON FAQ feed:
        #
        #     data = http.get_json(self.endpoint)
        #     for item in data.get("faqs", []):
        #         rec = self._record(
        #             self.default_collection,
        #             category=item.get("category", "RTO Services"),
        #             question=cleaner.clean_text(item["question"]),
        #             answer=cleaner.truncate_sentences(
        #                 cleaner.clean_text(item["answer"]), 600),
        #         )
        #         stats.inc(self.name, "extracted")
        #         yield rec
        #
        # For HTML pages use http.get_text(self.endpoint) + cleaner.clean_text
        # plus your own section/selector parsing.
        log.info("[%s] template source; nothing collected (disabled).", self.name)
        return iter(())
