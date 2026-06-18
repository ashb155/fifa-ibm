import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, level = 'Casual', language = 'English', team = 'None' } = await request.json();
    
    // 1. Try Langflow API
    try {
      const langflowRes = await fetch("http://127.0.0.1:7860/api/v1/run/stratos_flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_value: query,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "KnowledgeLevel": level,
            "Language": language,
            "Team": team
          }
        })
      });
      
      if (langflowRes.ok) {
        const langflowData = await langflowRes.json();
        return NextResponse.json({
          response: langflowData?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || "No response",
          source: "Langflow Pipeline"
        });
      }
    } catch (e) {
      console.log("Langflow failed, falling back to direct WatsonX:", e);
    }

    // 2. Direct WatsonX Fallback
    const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
    const PROJECT_ID = process.env.WATSONX_PROJECT_ID;

    if (!WATSONX_API_KEY || !PROJECT_ID) {
      throw new Error("Missing WatsonX credentials");
    }

    // Get IAM token
    const tokenRes = await fetch("https://iam.cloud.ibm.com/identity/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${WATSONX_API_KEY}`
    });
    const tokenData = await tokenRes.json();
    
    let systemPrompt = "You are Stratos, an AI football companion.";
    if (level === 'Tactical') {
      systemPrompt = "You are an elite tactical analyst. Use advanced football terminology, xG, pressing triggers, and formation deep-dives. Keep it under 200 words.";
    } else if (level === 'Beginner') {
      systemPrompt = "Explain football concepts using simple analogies. No jargon. Keep it under 90 words and end with a friendly question.";
    }

    const genRes = await fetch("https://jp-tok.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "meta-llama/llama-3-3-70b-instruct",
        project_id: PROJECT_ID,
        messages: [
          { role: "system", content: `${systemPrompt} Language: ${language}. Team: ${team}.` },
          { role: "user", content: query }
        ],
        max_tokens: 300
      })
    });

    if (!genRes.ok) {
      throw new Error(`WatsonX returned ${genRes.status}`);
    }

    const genData = await genRes.json();
    const assistantText = genData.choices?.[0]?.message?.content || "Generation failed";

    return NextResponse.json({
      response: assistantText,
      source: "Direct WatsonX Fallback"
    });

  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
