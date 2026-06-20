import os
import pandas as pd
from dotenv import load_dotenv

from backend.core.db import query_laws
from backend.core.watsonx_client import generate_response

from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from ibm_watsonx_ai import Credentials

load_dotenv()


eval_questions = [
    "What constitutes an offside offence?",
    "Can a goal be scored directly from an indirect free kick?",
]


def watsonx_judge(question, context, answer):
    """Uses IBM Granite to grade the generated answer based on the context."""
    api_key = os.getenv("WATSONX_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com").rstrip("/")

    credentials = Credentials(url=url, api_key=api_key)

    judge_prompt = f"""<|start_of_role|>system<|end_of_role|>You are an impartial judge evaluating an AI assistant.
Given a Question, Retrieved Context, and the Assistant's Answer, evaluate the answer on two metrics:
1. Faithfulness: Does the answer strictly rely on the context without hallucinating? (Pass/Fail)
2. Relevancy: Does the answer directly address the question? (Pass/Fail)
Reply STRICTLY in this format: "Faithful: [Pass/Fail] | Relevant: [Pass/Fail]"
<|start_of_role|>user<|end_of_role|>
Question: {question}
Context: {context}
Answer: {answer}
<|start_of_role|>assistant<|end_of_role|>"""

    model = ModelInference(
        model_id="ibm/granite-4-h-small",
        params={GenParams.MAX_NEW_TOKENS: 50, GenParams.DECODING_METHOD: "greedy"},
        credentials=credentials,
        project_id=project_id
    )

    try:
        return model.generate_text(prompt=judge_prompt).strip()
    except Exception as e:
        return f"Grading Failed: {e}"


def run_evaluation():
    results = []

    print("Running Watsonx RAG Pipeline & Evaluation...")
    for q in eval_questions:
        print(f"\nEvaluating: {q}")

        retrieved_chunks = query_laws(query_text=q, n_results=3)
        context_str = "\n---\n".join(retrieved_chunks) if retrieved_chunks else "No context found."

        answer = generate_response(
            query=q,
            persona="tactical",
            language="English",
            context=context_str
        )

        score = watsonx_judge(question=q, context=context_str, answer=answer)

        print(f"Answer: {answer}")
        print(f"Score:  {score}")

        results.append({
            "Question": q,
            "Answer": answer,
            "Evaluation": score
        })

    df = pd.DataFrame(results)
    df.to_csv("rag_custom_metrics.csv", index=False)
    print("\nEvaluation Complete! Saved to rag_custom_metrics.csv")


if __name__ == "__main__":
    run_evaluation()