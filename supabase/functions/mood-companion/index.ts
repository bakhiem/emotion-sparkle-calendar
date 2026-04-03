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
      : "No recent mood data available.";

    const taskSummary = totalTasks > 0
      ? `Today's tasks: ${completedTasks}/${totalTasks} completed.`
      : "No tasks for today.";

    const systemPrompt = `You are MoodFlow's AI companion — a warm, empathetic wellness buddy embedded in a mood tracking app. Your personality is like a caring friend who happens to know a lot about wellness.

Your job is to provide a SHORT, personalized response based on the user's mood data. Keep it to 2-3 short paragraphs max.

Response format — include ALL of these sections using these exact emoji headers:
💭 **Thought** — A brief empathetic reflection on their mood (1-2 sentences)
🎵 **Try This** — One specific recommendation: a song, meditation, breathing exercise, podcast, or activity (be specific with names/titles)
🌟 **Quote** — One inspiring or comforting quote relevant to their emotional state

Guidelines:
- If mood is "great" or "good": celebrate, suggest uplifting activities to maintain the vibe
- If mood is "okay": gentle encouragement, suggest something energizing or calming
- If mood is "bad" or "awful": be extra compassionate, suggest calming/healing activities (meditation, specific soothing songs, breathing exercises)
- If they've had a streak of good days: congratulate them enthusiastically!
- If tasks completion is high: acknowledge their productivity
- Keep recommendations SPECIFIC (e.g. "Listen to 'Weightless' by Marconi Union" not just "listen to calming music")
- Use a warm, friendly tone — not clinical
- Response must be concise — no more than 150 words total`;

    const userMessage = `Today's mood: ${todayMood || "not checked in yet"}
${moodSummary}
${taskSummary}

Please give me a personalized wellness insight.`;

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
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Take a deep breath 🌿 You're doing great.";

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
