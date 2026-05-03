import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChefHat, Sparkles, TrendingDown, TrendingUp, Heart, Clock, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/recipes")({
  component: RecipesPage,
});

type Goal = "lose" | "gain" | "healthy";

interface Recipe {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prep_time: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips?: string;
}

function RecipesPage() {
  const { t, lang } = useI18n();
  const [goal, setGoal] = useState<Goal>("healthy");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const generate = async () => {
    setLoading(true);
    setRecipes([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: { goal, language: lang, preferences: preferences.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRecipes(data.recipes || []);
    } catch (e: any) {
      toast.error(e.message || "Error generating recipes");
    } finally {
      setLoading(false);
    }
  };

  const goals: { key: Goal; icon: any; label: string; color: string }[] = [
    { key: "lose", icon: TrendingDown, label: t("goalLose"), color: "text-nutrisnap-blue" },
    { key: "gain", icon: TrendingUp, label: t("goalGain"), color: "text-nutrisnap-red" },
    { key: "healthy", icon: Heart, label: t("goalHealthy"), color: "text-nutrisnap-green" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <h1 className="text-base font-bold text-foreground font-display">{t("recipes")}</h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="px-5 space-y-5">
        <p className="text-xs text-muted-foreground text-center">{t("recipesSub")}</p>

        <div className="grid grid-cols-3 gap-2">
          {goals.map((g) => {
            const Icon = g.icon;
            const active = goal === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-3 border transition-all ${
                  active ? "border-primary bg-primary/10" : "border-border bg-nutrisnap-surface"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : g.color}`} />
                <span className={`text-[11px] font-semibold ${active ? "text-primary" : "text-foreground"}`}>{g.label}</span>
              </button>
            );
          })}
        </div>

        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder={t("preferencesPlaceholder")}
          rows={2}
          className="w-full rounded-xl bg-nutrisnap-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none"
        />

        <Button onClick={generate} disabled={loading} className="w-full h-12 rounded-xl gradient-orange text-primary-foreground border-0 font-semibold">
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("generating")}</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> {t("generateRecipes")}</>
          )}
        </Button>

        <div className="space-y-4">
          {recipes.map((r, i) => (
            <div key={i} className="rounded-2xl bg-nutrisnap-surface border border-border p-4 space-y-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{r.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">{Math.round(r.calories)} kcal</span>
                <span className="rounded-full bg-nutrisnap-red/10 text-nutrisnap-red px-2 py-0.5">P {Math.round(r.protein)}g</span>
                <span className="rounded-full bg-nutrisnap-blue/10 text-nutrisnap-blue px-2 py-0.5">C {Math.round(r.carbs)}g</span>
                <span className="rounded-full bg-nutrisnap-green/10 text-nutrisnap-green px-2 py-0.5">G {Math.round(r.fat)}g</span>
              </div>

              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.prep_time}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {r.servings}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-1">{t("ingredients")}</h4>
                <ul className="text-xs text-foreground/80 space-y-0.5 list-disc list-inside">
                  {r.ingredients.map((ing, j) => <li key={j}>{ing}</li>)}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-1">{t("instructions")}</h4>
                <ol className="text-xs text-foreground/80 space-y-1 list-decimal list-inside">
                  {r.instructions.map((step, j) => <li key={j}>{step}</li>)}
                </ol>
              </div>

              {r.tips && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-2">
                  <p className="text-[11px] text-foreground/80"><strong className="text-primary">{t("tips")}:</strong> {r.tips}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
