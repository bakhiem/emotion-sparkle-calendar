import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { todayMood, recentMoods, completedTasks, totalTasks } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const moodSummary = recentMoods && recentMoods.length > 0
      ? `Recent moods (last 7 days): ${recentMoods.map((m: { date: string; mood: string }) => `${m.date}: ${m.mood}`).join(", ")}`
      : "No recent mood data.";

    const taskSummary = totalTasks > 0
      ? `Tasks: ${completedTasks}/${totalTasks} done.`
      : "";

    const systemPrompt = `You are a warm wellness companion in a mood tracking app. Reply with EXACTLY ONE short sentence (max 20 words). It can be:
- A specific song recommendation (include artist name)
- A quick meditation tip
- An inspiring quote
- A congratulation if they've been doing well
- A gentle encouragement if they're feeling down

Match the tone to their mood. Be specific, warm, and brief. No emoji headers, no sections, no formatting — just one plain sentence.`;

    const userMessage = `Mood: ${todayMood || "unknown"}. ${moodSummary} ${taskSummary}`.trim();

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
    const content = data.choices?.[0]?.message?.content || "Take a deep breath — you're doing great.";

    return new Response(JSON.stringify({ message: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mood-companion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
