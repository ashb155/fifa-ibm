import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

import os
# Mock os environment variables before importing modules
os.environ["FOOTBALL_DATA_ORG_KEY"] = "mock_key"
os.environ["LANGFLOW_API_URL"] = "http://mocked:7860"
os.environ["WATSONX_API_KEY"] = "mock_key"
os.environ["WATSONX_PROJECT_ID"] = "mock_project_id"

# Import our backend components
from backend.main import app
from mcp_server import query_football_laws, get_tactical_timeline, get_live_match_context
from backend.core.granite import generate_response

class TestFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_create_session(self):
        response = self.client.post("/session/create", json={"match_id": "test_123"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["match_id"], "test_123")

    def test_update_session(self):
        response = self.client.patch("/session/test_session_id", json={"key": "value"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["session_id"], "test_session_id")

    def test_get_current_match(self):
        response = self.client.get("/match/current")
        self.assertEqual(response.status_code, 200)

    def test_get_timeline(self):
        response = self.client.get("/timeline/test_123")
        self.assertEqual(response.status_code, 200)

    @patch('httpx.AsyncClient.post', new_callable=AsyncMock)
    def test_chat_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "outputs": [{"outputs": [{"results": {"message": {"text": "Langflow mock response"}}}]}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        response = self.client.post("/chat", json={"query": "Hello", "persona": "casual", "language": "English"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "Langflow mock response")

    @patch('httpx.AsyncClient.post', new_callable=AsyncMock)
    def test_chat_failure(self, mock_post):
        mock_post.side_effect = Exception("Connection Refused")
        response = self.client.post("/chat", json={"query": "Hello"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue("Error calling Langflow API" in response.json()["response"])


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

    @patch('mcp_server.sb.events')
    def test_get_tactical_timeline(self, mock_events):
        import pandas as pd
        df = pd.DataFrame({
            'type': ['Substitution', 'Tactical Shift'],
            'minute': [45, 60],
            'second': [0, 30],
            'team': ['A', 'B'],
            'player': ['Player1', None],
            'substitution_replacement': ['Player2', None],
            'tactics': [None, {'formation': '4-4-2'}]
        })
        mock_events.return_value = df
        
        res = get_tactical_timeline(123)
        self.assertIn("45' - A: Player1 out, Player2 in", res)
        self.assertIn("60' - B: Formation shift to 4-4-2", res)

    @patch('mcp_server.requests.get')
    def test_get_live_match_context(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"status": "FINISHED", "score": {"fullTime": "2-1"}}
        mock_get.return_value = mock_resp
        
        res = get_live_match_context("123")
        self.assertIn("Status: FINISHED", res)
        self.assertIn("Score: 2-1", res)


class TestGranite(unittest.TestCase):
    @patch('backend.core.granite.ModelInference')
    def test_generate_response(self, mock_model_inference):
        mock_model = MagicMock()
        mock_model.generate_text.return_value = "Mock Granite Response "
        mock_model_inference.return_value = mock_model
        
        res = generate_response("Query", "Context", "casual")
        self.assertEqual(res, "Mock Granite Response")
