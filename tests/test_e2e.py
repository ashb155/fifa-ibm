import socket
import subprocess
import time
import sys

import pytest
import requests


def _is_port_reachable(host: str = "127.0.0.1", port: int = 8000, timeout: float = 1.0) -> bool:
    """Check whether a TCP connection can be established to *host*:*port*."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


@pytest.mark.skipif(
    not _is_port_reachable("127.0.0.1", 8000),
    reason="Backend server is not running on port 8000",
)
def test_e2e_endpoints():
    """End-to-end smoke test that hits the live backend endpoints.

    The test is automatically skipped when the backend is not reachable on
    ``127.0.0.1:8000``.  Start the MCP server and the FastAPI backend before
    running this test to have it execute.
    """
    base = "http://127.0.0.1:8000"
    errors = 0

    # /match/current
    r = requests.get(f"{base}/match/current")
    assert r.status_code == 200, f"/match/current returned {r.status_code}"

    # /timeline/3869685
    r = requests.get(f"{base}/timeline/3869685")
    assert r.status_code == 200, f"/timeline/3869685 returned {r.status_code}"

    # /chat (without Langflow running – should degrade gracefully)
    r = requests.post(f"{base}/chat", json={"query": "Hello"})
    assert r.status_code == 200, f"/chat returned {r.status_code}"

    # We expect the /chat endpoint to handle missing Langflow gracefully and
    # surface that in the response source.
    source = r.json().get("source", "")
    assert "Error" in source or "Fallback" in source, (
        f"Expected Langflow-missing indicator in source, got: {source!r}"
    )
