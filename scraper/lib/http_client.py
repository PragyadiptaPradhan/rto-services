"""
Polite, resilient HTTP client.

Features required by the pipeline spec:
  - request delays / rate limiting (min_delay + jitter between calls)
  - automatic retries with exponential backoff on transient failures
  - honour HTTP 429/503 Retry-After
  - timeouts
  - descriptive User-Agent
  - transparent success/failure counting via the shared Stats object

Uses only the Python standard library.
"""

from __future__ import annotations

import json
import logging
import random
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

from .logger import Stats


class HTTPClient:
    def __init__(self, stats: Stats, cfg: Dict[str, Any], logger: logging.Logger) -> None:
        self.stats = stats
        self.cfg = cfg
        self.log = logger
        self._last_request_ts = 0.0

    # -- public API --------------------------------------------------------
    def get_text(self, url: str, params: Optional[Dict[str, str]] = None) -> str:
        return self._request(url, params, parse_json=False)

    def get_json(self, url: str, params: Optional[Dict[str, str]] = None) -> Any:
        return self._request(url, params, parse_json=True)

    # -- internals ---------------------------------------------------------
    def _build_url(self, url: str, params: Optional[Dict[str, str]]) -> str:
        if not params:
            return url
        sep = "&" if "?" in url else "?"
        return url + sep + urllib.parse.urlencode(params)

    def _throttle(self) -> None:
        """Enforce a minimum delay (+ jitter) since the previous request."""
        min_delay = self.cfg.get("min_delay", 0)
        jitter = self.cfg.get("jitter", 0)
        if min_delay <= 0:
            return
        elapsed = time.monotonic() - self._last_request_ts
        wait = min_delay + random.uniform(0, jitter) - elapsed
        if wait > 0:
            time.sleep(wait)

    def _request(self, url: str, params, parse_json: bool):
        full_url = self._build_url(url, params)
        attempt = 0
        max_retries = self.cfg.get("max_retries", 3)
        backoff = self.cfg.get("backoff_base", 1.5)
        backoff_max = self.cfg.get("backoff_max", 30)
        timeout = self.cfg.get("timeout", 20)
        headers = {"User-Agent": self.cfg.get("user_agent", "rto-pipeline/1.0")}

        last_err: Optional[Exception] = None
        while attempt <= max_retries:
            self._throttle()
            self._last_request_ts = time.monotonic()
            req = urllib.request.Request(full_url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    body = resp.read().decode("utf-8", errors="replace")
                self.stats.req_ok()
                self.log.debug("GET 200 %s", full_url)
                return json.loads(body) if parse_json else body
            except urllib.error.HTTPError as e:
                last_err = e
                retry_after = None
                if e.code in (429, 503) and self.cfg.get("respect_retry_after"):
                    try:
                        retry_after = int(e.headers.get("Retry-After", ""))
                    except (TypeError, ValueError):
                        retry_after = None
                self.log.warning("GET %s %s | %s (Retry-After=%s)",
                                 e.code, full_url, e.reason, retry_after)
                # Retry only on 429/5xx; 4xx (except 429) are fatal.
                if e.code not in (429, 500, 502, 503, 504):
                    self.stats.req_fail()
                    raise
                wait = retry_after or min(backoff * (2 ** attempt), backoff_max)
                self.log.info("  retrying in %.1fs (attempt %d/%d)",
                              wait, attempt + 1, max_retries)
                time.sleep(wait)
                attempt += 1
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                last_err = e
                self.log.warning("GET ERR %s | %s", full_url, e)
                wait = min(backoff * (2 ** attempt), backoff_max)
                time.sleep(wait)
                attempt += 1

        self.stats.req_fail()
        raise last_err or RuntimeError(f"Request failed after retries: {full_url}")
