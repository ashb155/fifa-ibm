import logging
import os
from typing import Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

def generate_response(query: str, persona: str, language: str, context: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """
    Calls the IBM Granite API (ibm/granite-4-h-small) via WatsonX to generate an adaptive response.
    """
    api_key = os.getenv("WATSONX_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com").rstrip("/")

    if not api_key:
        logger.warning("WATSONX_API_KEY is empty — Granite calls will fail.")
    if not project_id:
        logger.warning("WATSONX_PROJECT_ID is empty — Granite calls will fail.")

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
    
    if history:
        for msg in history[-4:]:  # Keep last 4 messages to avoid context window blowup
            role = msg.get("role", "user")
            content = msg.get("content", "")
            full_prompt += f"<|start_of_role|>{role}<|end_of_role|>{content}"
            
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
            model_id="ibm/granite-4-h-small",
            params=parameters,
            credentials=credentials,
            project_id=project_id
        )


        import time
        
        for attempt in range(3):
            try:
                return model.generate_text(prompt=full_prompt).strip()
            except Exception as e:
                if attempt == 2:
                    raise e
                time.sleep(2 ** attempt)  # Simple exponential backoff: 1s, 2s

    except Exception as e:
        return f"IBM Granite generation failed: {str(e)}"
