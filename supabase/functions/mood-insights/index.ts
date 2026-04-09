import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, moods, tasks, answers, lang } = await req.json();
    const langInstruction = lang === 'en' 
      ? 'Respond in English.' 
      : 'Respond in Vietnamese (tiếng Việt).';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userMessage = "";
    let tools: any[] | undefined;
    let tool_choice: any | undefined;

    if (type === "daily-coach") {
      systemPrompt = `You are a warm, personal wellness coach in a mood tracking app. Based on the user's mood data, create a personalized daily message and one mini challenge. Be specific, warm, and reference their actual patterns. Speak naturally like a caring friend.`;
      userMessage = `Today's mood: ${moods.current || "not set yet"}. Last 7 days moods: ${JSON.stringify(moods.recent)}. Tasks completed today: ${tasks?.completed || 0}/${tasks?.total || 0}.`;
      tools = [{
        type: "function",
        function: {
          name: "daily_coach_response",
          description: "Return a personalized daily coach message and mini challenge",
          parameters: {
            type: "object",
            properties: {
              message: { type: "string", description: "A warm, personal message (2-3 sentences max, reference their mood patterns)" },
              challenge: { type: "string", description: "One specific mini challenge for today (max 15 words, actionable)" },
              challenge_emoji: { type: "string", description: "One emoji that fits the challenge" },
            },
            required: ["message", "challenge", "challenge_emoji"],
            additionalProperties: false,
          },
        },
      }];
      tool_choice = { type: "function", function: { name: "daily_coach_response" } };

    } else if (type === "journal-questions") {
      systemPrompt = `You are a reflective wellness journaler. Based on the user's mood data from this week, generate 2-3 thoughtful, open-ended questions to help them reflect. Reference specific days and moods when possible. Questions should be warm, non-judgmental, and encourage self-reflection. Write in the user's perspective.`;
      userMessage = `This week's moods: ${JSON.stringify(moods)}. Tasks: ${JSON.stringify(tasks)}`;
      tools = [{
        type: "function",
        function: {
          name: "journal_questions",
          description: "Return reflective journal questions based on mood data",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: { type: "string" },
                description: "2-3 reflective questions, each warm and specific to their week",
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      }];
      tool_choice = { type: "function", function: { name: "journal_questions" } };

    } else if (type === "journal-summary") {
      systemPrompt = `You are a compassionate wellness journaler. The user answered some reflective questions about their week. Combine their answers with their mood data to write a beautiful, warm journal summary. Write it as if it's their personal diary entry. Keep it under 100 words, poetic but genuine.`;
      userMessage = `Mood data: ${JSON.stringify(moods)}. Questions and answers: ${JSON.stringify(answers)}`;

    } else if (type === "trend-analysis") {
      systemPrompt = `You are a compassionate wellness analyst in a mood tracking app. Analyze the user's mood data and provide insights in this EXACT format:

**🔍 Pattern Detected**
[One sentence about a pattern you notice]

**💡 Insight**
[One sentence of actionable advice based on the pattern]

**🎯 Focus Area**
[One specific thing they could try this week]

Keep it warm, specific, and under 60 words total. Use their actual data.`;
      userMessage = `Mood entries: ${JSON.stringify(moods)}. Tasks completed: ${JSON.stringify(tasks)}`;

    } else if (type === "activity-suggestions") {
      systemPrompt = `You are a wellness companion. Based on the user's mood, give ONE short suggestion. Max 20 words. No formatting. Be specific and warm.`;
      userMessage = `Current mood: ${moods.current}. Recent pattern: ${moods.recent}`;

    } else if (type === "weekly-journal") {
      systemPrompt = `You are a reflective wellness journaler. Write a brief, warm weekly emotional summary. Keep it personal, warm, and under 80 words total.`;
      userMessage = `This week's moods: ${JSON.stringify(moods)}. Tasks: ${JSON.stringify(tasks)}`;

    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    };
    if (tools) body.tools = tools;
    if (tool_choice) body.tool_choice = tool_choice;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();

    // Handle tool calling responses
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = data.choices?.[0]?.message?.content || "Unable to generate insight right now.";
    return new Response(JSON.stringify({ message: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mood-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
