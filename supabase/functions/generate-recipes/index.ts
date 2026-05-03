import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, language, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lang = language === "en" ? "English" : language === "es" ? "Spanish" : "Portuguese (pt-BR)";
    const goalText: Record<string, string> = {
      lose: "weight loss (low calorie, high protein, satiating)",
      gain: "weight gain (high calorie, high protein, calorie-dense healthy foods)",
      healthy: "balanced healthy meals (nutritious, varied, balanced macros)",
    };
    const objective = goalText[goal] || goalText.healthy;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert nutritionist and chef. Generate 3 unique, practical recipes focused on ${objective}. Reply ENTIRELY in ${lang}. Use common, accessible ingredients.`,
          },
          {
            role: "user",
            content: `Generate 3 recipes for ${objective}.${preferences ? ` Preferences/restrictions: ${preferences}` : ""}`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_recipes",
            description: "Return 3 recipes",
            parameters: {
              type: "object",
              properties: {
                recipes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" },
                      prep_time: { type: "string" },
                      servings: { type: "number" },
                      ingredients: { type: "array", items: { type: "string" } },
                      instructions: { type: "array", items: { type: "string" } },
                      tips: { type: "string" },
                    },
                    required: ["name", "description", "calories", "protein", "carbs", "fat", "prep_time", "servings", "ingredients", "instructions"],
                  },
                },
              },
              required: ["recipes"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_recipes" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again in a few seconds." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Could not parse AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-recipes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
