import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, moods, tasks } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userMessage = "";

    if (type === "trend-analysis") {
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
      systemPrompt = `You are a wellness companion in a mood tracking app. Based on the user's mood, give EXACTLY ONE short suggestion. Randomly pick ONE of these types:
- A specific song recommendation (song name + artist)
- An inspiring quote (with author)
- A quick mindfulness tip (one sentence)
- A fun micro-activity

Max 20 words. No emoji headers, no formatting, no labels — just the suggestion itself. Be specific and warm.`;

      userMessage = `Current mood: ${moods.current}. Recent pattern: ${moods.recent}`;
    } else if (type === "weekly-journal") {
      systemPrompt = `You are a reflective wellness journaler. Write a brief, warm weekly emotional summary for the user based on their mood data. Format:

**📖 Your Week in Feelings**
[2-3 sentences summarizing their emotional week — highs, lows, patterns]

**✨ Highlight**
[One positive thing from their week, even if it was tough]

**🌱 Looking Ahead**
[One encouraging sentence for next week]

Keep it personal, warm, and under 80 words total. Reference specific days if possible.`;

      userMessage = `This week's moods: ${JSON.stringify(moods)}. Tasks: ${JSON.stringify(tasks)}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
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
