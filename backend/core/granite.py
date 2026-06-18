import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

def generate_response(query: str, persona: str, language: str, context: str, history: list = None) -> str:
    """
    Calls the IBM Granite API (ibm/granite-3-8b-instruct) to generate an adaptive response.
    """
    api_key = os.getenv("WATSONX_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    url = os.getenv("WATSONX_URL", "https://jp-tok.ml.cloud.ibm.com").rstrip("/")

    # Define system prompts based on Persona
    system_prompts = {
        "beginner": "You are a friendly and encouraging football companion. Explain the user's query with zero jargon. Use simple analogies. Keep the response under 90 words. Always end with a simple follow-up question to keep the user engaged.",
        "casual": "You are a knowledgeable but accessible football companion. Answer the user's query in a conversational tone. If you use a football term, briefly define it. Keep the response under 150 words.",
        "tactical": "You are an elite football tactical analyst. Answer the user's query using full football terminology (e.g., xG, half-spaces, low block, transitions). Provide deep tactical insight based on the provided context. Keep the response under 200 words."
    }

    persona = persona.lower()
    system_instruction = system_prompts.get(persona, system_prompts["casual"])
    
    # Assembly
    full_prompt = f"<|start_of_role|>system<|end_of_role|>{system_instruction}\nOutput Language: {language}"
    if context:
        full_prompt += f"\nContext: {context}"
    full_prompt += f"<|start_of_role|>user<|end_of_role|>{query}<|start_of_role|>assistant<|end_of_role|>"

    # Use the SDK to avoid raw REST routing issues
    try:
        from ibm_watsonx_ai.foundation_models import ModelInference
        from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
        from ibm_watsonx_ai import Credentials

        credentials = Credentials(
            url=url,
            api_key=api_key,
        )

        parameters = {
            GenParams.DECODING_METHOD: "greedy",
            GenParams.MAX_NEW_TOKENS: 250,
            GenParams.REPETITION_PENALTY: 1.05
        }

        model = ModelInference(
            model_id="meta-llama/llama-3-3-70b-instruct",
            params=parameters,
            credentials=credentials,
            project_id=project_id
        )

        response = model.generate_text(prompt=full_prompt)
        return response.strip()
    except Exception as e:
        return f"IBM Granite generation failed: {str(e)}"
