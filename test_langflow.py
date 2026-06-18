import json
from langflow.load import run_flow_from_json

def test_langflow():
    print("Testing Langflow Flow Execution...")
    try:
        result = run_flow_from_json(
            flow="stratos_flow.json",
            input_value="Hello",
            fallback_to_env_vars=True,
            tweaks={
                "ChatInput-1": {"input_value": "What is an offside?"},
                "PromptTemplate-1": {"language": "English", "knowledge_level": "beginner", "context": "Player was behind the last defender."}
            }
        )
        print("Langflow executed successfully!")
        print("Result:", result)
    except Exception as e:
        print(f"Error executing flow: {e}")

if __name__ == "__main__":
    test_langflow()
