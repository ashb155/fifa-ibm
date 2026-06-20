import os
import csv
from dotenv import load_dotenv

from backend.core.db import query_laws
from backend.core.watsonx_client import generate_response

load_dotenv()


eval_questions = [
    "What constitutes an offside offence?",
    "Can a goal be scored directly from an indirect free kick?",
]


def watsonx_judge(question, context, answer):
    """Uses IBM Granite to grade the generated answer based on the context."""
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

    try:
        # Re-use existing wrapper
        return generate_response(
            query=judge_prompt,
            persona="casual",
            language="English",
            context=""
        )
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

    with open("rag_custom_metrics.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Question", "Answer", "Evaluation"])
        writer.writeheader()
        writer.writerows(results)
        
    print("\nEvaluation Complete! Saved to rag_custom_metrics.csv")


if __name__ == "__main__":
    run_evaluation()