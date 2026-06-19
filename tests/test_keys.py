"""Integration tests that validate real API keys against live services.
Marked as integration tests — skipped unless RUN_INTEGRATION_TESTS=1 is set.
These fail when run alongside unit tests because test_backend.py injects mock env vars."""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
import pytest
import requests

# Force reload .env to override any mock values set by earlier test modules (e.g. test_backend.py)
load_dotenv(override=True)

_SKIP_REASON = "Set RUN_INTEGRATION_TESTS=1 to run live API key validation"
_run_integration = os.getenv("RUN_INTEGRATION_TESTS") == "1"


@pytest.mark.skipif(not _run_integration, reason=_SKIP_REASON)
def test_football_data():
    """Verify that the Football-Data.org API key is valid and returns 200."""
    api_key = os.getenv("FOOTBALL_DATA_ORG_KEY")
    assert api_key, "FOOTBALL_DATA_ORG_KEY is not set"
    r = requests.get(
        "https://api.football-data.org/v4/competitions",
        headers={"X-Auth-Token": api_key},
    )
    assert r.status_code == 200, f"Football-Data API returned {r.status_code}"


@pytest.mark.skipif(not _run_integration, reason=_SKIP_REASON)
def test_watsonx():
    """Verify that the WatsonX API key works and generates a non-error response."""
    from backend.core.watsonx_client import generate_response

    res = generate_response("Say hello", "casual", "English", "No context")
    assert "Error" not in res, f"WatsonX returned an error: {res}"
    assert "failed" not in res.lower(), f"WatsonX indicated failure: {res}"
