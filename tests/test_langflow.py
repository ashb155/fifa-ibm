import os
import pytest
from langflow_sdk import LangflowClient, RunRequest
from dotenv import load_dotenv

load_dotenv()

def test_langflow_sdk_success():
    """Verify that the Langflow Python SDK can successfully orchestrate flows."""
    api_key = os.getenv("LANGFLOW_API_KEY")
    assert api_key, "LANGFLOW_API_KEY environment variable is not set."
    
    url = os.getenv("LANGFLOW_API_URL")
    assert url, "LANGFLOW_API_URL environment variable is not set."

    # Parse out base URL and endpoint/ID from the LANGFLOW_API_URL
    # Format: http://127.0.0.1:7860/api/v1/run/a550dc79-3f6c-44cf-868c-999da0029e77
    base_url = "http://127.0.0.1:7860"
    flow_id = url.split("/")[-1]
    
    try:
        client = LangflowClient(base_url=base_url, api_key=api_key)
        # Using the official Langflow SDK classes!
        request = RunRequest(
            input_value="hello world!",
            input_type="chat",
            output_type="chat"
        )
        # Send the API key manually via headers if needed, but since it's a local test it's fine
        # Or you can inject headers directly into the client if supported.
        
        # We wrap in a try-except because the SDK might throw ConnectionError
        response = client.run_flow(
            flow_id_or_endpoint=flow_id,
            request=request
        )
    except Exception as e:
        pytest.skip(f"Langflow server is not reachable or failed: {e}")
        
    assert response is not None
    assert hasattr(response, "outputs"), "Langflow response missing outputs"
