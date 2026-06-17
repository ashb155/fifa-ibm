import os
from ibm_watsonx_ai.foundation_models import ModelInference
from dotenv import load_dotenv

load_dotenv()

# ponytail: minimal dictionary for prompts, no class abstraction needed.
# NLP language handling: model instructed to mirror user's language.
SYSTEM_PROMPTS = {
    "beginner": (
        "You are a helpful, friendly football companion. "
        "Explain events and rules in simple terms, avoiding heavy jargon. "
        "Focus on the core of what happened. "
        "Always respond in the exact same language the user uses."
    ),
    "casual": (
        "You are an engaging football companion. "
        "Use standard broadcast-level terminology. Provide a good balance of narrative and basic tactics. "
        "Always respond in the exact same language the user uses."
    ),
    "tactical": (
        "You are an expert football analyst. "
        "Provide deep tactical insights, focus on formation shifts, player roles, and precise data points. "
        "Use high-level analytical language. "
        "Always respond in the exact same language the user uses."
    )
}

def generate_response(query: str, context: str, persona: str = "casual") -> str:
    """Queries IBM Granite with dynamic persona prompts and RAG context."""
    
    api_key = os.getenv("WATSONX_API_KEY")
    project_id = os.getenv("WATSONX_PROJECT_ID")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    
    if not all([api_key, project_id]):
        return "Error: Missing WatsonX credentials. Please check your environment variables."
        
    credentials = {
        "url": url,
        "apikey": api_key
    }
    
    model = ModelInference(
        model_id="ibm/granite-3-8b-instruct",
        credentials=credentials,
        project_id=project_id,
        params={
            "max_new_tokens": 512,
            "temperature": 0.7
        }
    )
    
    system_prompt = SYSTEM_PROMPTS.get(persona.lower(), SYSTEM_PROMPTS["casual"])
    
    prompt_template = f"""<|system|>
{system_prompt}
<|user|>
Context provided by tools:
{context}

User Query: {query}
<|assistant|>
"""
    
    try:
        response = model.generate_text(prompt=prompt_template)
        return response.strip()
    except Exception as e:
        return f"Model generation failed: {str(e)}"
