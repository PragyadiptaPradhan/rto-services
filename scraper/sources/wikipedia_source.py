"""
Wikipedia (MediaWiki) source adapter.

Uses the public MediaWiki Action API with `prop=extracts&explaintext` to pull
clean, structured article text — no HTML scraping fragility, and the API is
explicitly built for reuse. Implements:

  * multi-page discovery (a configured list of article titles)
  * API pagination via the `continue` token
  * per-page error isolation
  * section -> FAQ record mapping using the shared text cleaner

One WikipediaSource instance == one topical cluster. The config registers two
instances (driving-licence, vehicle-registration) to demonstrate true
multi-source collection; adding another cluster is a one-line config edit.
"""

from __future__ import annotations

import logging
import urllib.parse
from typing import Any, Dict, Iterable, List, Tuple

from ..lib.base_source import BaseSource
from ..lib import text_cleaner as tc

API_ENDPOINT = "https://en.wikipedia.org/w/api.php"


class WikipediaSource(BaseSource):
    def __init__(
        self,
        name: str,
        category: str,
        topic: str,
        pages: List[str],
        max_records: int = 30,
        enabled: bool = True,
    ) -> None:
        super().__init__(name, enabled)
        self.category = category
        self.topic = topic
        self.pages = pages
        self.max_records = max_records
        self.default_collection = "general_faqs"

    # -- orchestrator entry ------------------------------------------------
    def collect(self, http, cleaner, stats, log: logging.Logger) -> Iterable[Dict[str, Any]]:
        produced = 0
        for page in self.pages:
            if produced >= self.max_records:
                break
            try:
                extracts = self._fetch_extracts(http, log, page)
            except Exception as exc:  # isolation: keep going on failure
                log.error("[%s] failed to fetch '%s': %s", self.name, page, exc)
                continue

            for title, extract in extracts:
                if produced >= self.max_records:
                    break
                for heading, body in tc.split_sections(extract):
                    if produced >= self.max_records:
                        break
                    if heading and heading.lower() in _SKIP_HEADINGS:
                        continue
                    question = tc.build_question(heading or title, self.topic)
                    answer = tc.truncate_sentences(body, 600)
                    if not answer:
                        continue
                    rec = self._record(
                        self.default_collection,
                        category=self.category,
                        question=question,
                        answer=answer,
                    )
                    stats.inc(self.name, "extracted")
                    produced += 1
                    yield rec

    # -- MediaWiki API (with pagination) -----------------------------------
    def _fetch_extracts(self, http, log: logging.Logger, page: str) -> List[Tuple[str, str]]:
        params = {
            "action": "query",
            "format": "json",
            "prop": "extracts",
            "explaintext": "1",
            "redirects": "1",
            "titles": page,
            "exlimit": "max",
        }
        results: List[Tuple[str, str]] = []
        while True:
            data = http.get_json(API_ENDPOINT, params)
            pages = (data.get("query") or {}).get("pages") or {}
            for pid, p in pages.items():
                if p.get("missing") is not None or p.get("invalid") is not None:
                    log.warning("[%s] page not found: %s", self.name, page)
                    continue
                extract = p.get("extract")
                if extract:
                    results.append((p.get("title", page), extract))
            # pagination: follow the continue token if present
            cont = data.get("continue")
            if not cont:
                break
            params = {**params, **cont}
        return results


# imported lazily to avoid circular import at module load
from .. import config as _cfg  # noqa: E402
_SKIP_HEADINGS = {h.lower() for h in _cfg.SKIP_HEADINGS}
