import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
import asyncio
import json

import os

# Save real env values before mocking, so test_keys.py can use them later
_real_env = {
    "FOOTBALL_DATA_ORG_KEY": os.environ.get("FOOTBALL_DATA_ORG_KEY", ""),
    "LANGFLOW_API_URL": os.environ.get("LANGFLOW_API_URL", ""),
    "WATSONX_API_KEY": os.environ.get("WATSONX_API_KEY", ""),
    "WATSONX_PROJECT_ID": os.environ.get("WATSONX_PROJECT_ID", ""),
}

# Mock os environment variables before importing modules that read them at import time
os.environ["FOOTBALL_DATA_ORG_KEY"] = "mock_key"
os.environ["LANGFLOW_API_URL"] = "http://mocked:7860"
os.environ["WATSONX_API_KEY"] = "mock_key"
os.environ["WATSONX_PROJECT_ID"] = "mock_project_id"

# Import our backend components
from backend.main import app
from mcp_server import query_football_laws, get_tactical_timeline, get_live_match_context
from backend.core.watsonx_client import generate_response

# Restore real env values so subsequent test modules (test_keys.py) see them
for k, v in _real_env.items():
    if v:
        os.environ[k] = v
    elif k in os.environ and os.environ[k] == "mock_key":
        del os.environ[k]

class TestFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)


    def test_get_current_match(self):
        response = self.client.get("/match/current")
        self.assertEqual(response.status_code, 200)

    def test_get_timeline(self):
        response = self.client.get("/timeline/test_123")
        self.assertEqual(response.status_code, 200)

    def test_chat_success(self):
        # Integration test: Hits the real Langflow API without mocking
        response = self.client.post("/chat", json={"query": "hello world!", "persona": "casual", "language": "English"})
        self.assertEqual(response.status_code, 200)
        # Assert that it successfully used Langflow Orchestration instead of falling back
        self.assertEqual(response.json()["source"], "Langflow Orchestration (Granite + Context Forge)")




class TestMCPTools(unittest.TestCase):
    @patch('mcp_server.collection')
    def test_query_football_laws(self, mock_collection):
        mock_collection.query.return_value = {"documents": [["Law 1", "Law 2"]]}
        res = query_football_laws("What is offside?")
        self.assertIn("Law 1", res)

    @patch('mcp_server.collection', None)
    def test_query_football_laws_no_db(self):
        res = query_football_laws("What is offside?")
        self.assertEqual(res, "Football laws search is currently unavailable (DB error).")

    @patch('httpx.AsyncClient')
    def test_get_tactical_timeline(self, mock_client_cls):
        mock_data = [
            {
                "type": {"name": "Substitution"},
                "minute": 45,
                "second": 0,
                "team": {"name": "A"},
                "player": {"name": "Player1"},
                "substitution": {"replacement": {"name": "Player2"}}
            },
            {
                "type": {"name": "Tactical Shift"},
                "minute": 60,
                "second": 30,
                "team": {"name": "B"},
                "tactics": {"formation": "4-4-2"}
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = mock_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_client

        res = asyncio.run(get_tactical_timeline(123))
        self.assertIn("45' - A: Player1 out, Player2 in", res)
        self.assertIn("60' - B: Formation shift to 4-4-2", res)

    @patch('httpx.AsyncClient')
    def test_get_live_match_context(self, mock_client_cls):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "FINISHED", "score": {"fullTime": "2-1"}}

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_client

        res = asyncio.run(get_live_match_context("123"))
        self.assertIn("Status: FINISHED", res)
        self.assertIn("Score: 2-1", res)


class TestGranite(unittest.TestCase):
    @patch('ibm_watsonx_ai.foundation_models.ModelInference')
    def test_generate_response(self, mock_model_inference):
        mock_model = MagicMock()
        mock_model.generate_text.return_value = "Mock Granite Response "
        mock_model_inference.return_value = mock_model
        
        res = generate_response("Query", "casual", "English", "Context")
        self.assertEqual(res, "Mock Granite Response")
