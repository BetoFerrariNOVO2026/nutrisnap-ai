import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, Upload, ImageIcon, Zap, Crown, Lock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NutritionResult } from "@/components/NutritionResult";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
});

const FREE_DAILY_LIMIT = 1;

function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [plan, setPlan] = useState<string>("free");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const limitReached = plan === "free" && todayCount >= FREE_DAILY_LIMIT;

  useEffect(() => {
    if (!user) return;
    const loadUsage = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [{ count }, { data: profile }] = await Promise.all([
        supabase
          .from("meals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("scanned_at", startOfDay.toISOString()),
        supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const userPlan = profile?.subscription_plan || "free";
      const c = count || 0;
      setPlan(userPlan);
      setTodayCount(c);
      // Auto-open modal if limit reached on page load
      if (userPlan === "free" && c >= FREE_DAILY_LIMIT && !result) {
        setUpgradeOpen(true);
      }
    };
    loadUsage();
  }, [user, result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (limitReached) {
      setUpgradeOpen(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImage(base64);
      analyzeWithAI(base64);
    };
    reader.readAsDataURL(file);
  };
  const analyzeWithAI = async (imageBase64: string) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64 },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error(err.message || "Erro ao analisar imagem");
      // Fallback to mock data if AI fails
      setResult({
        foods: [
          { name: "Alimento detectado", calories: 200, protein: 10, carbs: 30, fat: 5, portion: "100g" },
        ],
        healthScore: 5,
        suggestions: ["Não foi possível analisar com IA. Tente novamente."],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!user || !result) {
      toast.error("Faça login para salvar refeições");
      return;
    }

    try {
      const totalCals = result.foods.reduce((a: number, f: any) => a + f.calories, 0);
      const totalProtein = result.foods.reduce((a: number, f: any) => a + f.protein, 0);
      const totalCarbs = result.foods.reduce((a: number, f: any) => a + f.carbs, 0);
      const totalFat = result.foods.reduce((a: number, f: any) => a + f.fat, 0);

      const mealName = result.foods.map((f: any) => f.name).join(", ");

      const { data: meal, error: mealError } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          name: mealName,
          total_calories: totalCals,
          total_protein: totalProtein,
          total_carbs: totalCarbs,
          total_fat: totalFat,
          health_score: result.healthScore,
          suggestions: result.suggestions,
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Insert individual foods
      const foods = result.foods.map((f: any) => ({
        meal_id: meal.id,
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        portion: f.portion,
      }));

      await supabase.from("meal_foods").insert(foods);

      toast.success("Refeição salva com sucesso!");
      resetScan();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erro ao salvar refeição");
    }
  };

  const resetScan = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Scanner</h1>
        <p className="text-xs text-muted-foreground mt-1">Tire uma foto do seu prato</p>
      </header>

      <div className="px-5">
        {!image ? (
          <div className="space-y-4">
            {limitReached && (
              <div className="rounded-2xl gradient-orange p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-primary-foreground" />
                  <h2 className="text-sm font-bold text-primary-foreground">Limite diário atingido</h2>
                </div>
                <p className="text-xs text-primary-foreground/90 mb-3">
                  Você já usou seu scan gratuito de hoje. Assine PRO para scans ilimitados.
                </p>
                <button onClick={() => setUpgradeOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-primary-foreground px-4 py-1.5 text-xs font-bold text-primary">
                  <Crown className="h-3 w-3" /> Fazer upgrade
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (limitReached) {
                  setUpgradeOpen(true);
                  return;
                }
                fileRef.current?.click();
              }}
              disabled={false}
              className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-colors ${
                limitReached
                  ? "border-muted bg-muted/30 opacity-60"
                  : "border-primary/30 bg-nutrisnap-surface hover:border-primary/60"
              }`}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${limitReached ? "bg-muted" : "gradient-orange scan-pulse"}`}>
                {limitReached ? (
                  <Lock className="h-7 w-7 text-muted-foreground" />
                ) : (
                  <Camera className="h-7 w-7 text-primary-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {limitReached ? "Bloqueado" : "Toque para escanear"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {limitReached ? "Faça upgrade para continuar" : "ou arraste uma imagem"}
                </p>
              </div>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => limitReached ? setUpgradeOpen(true) : galleryRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-nutrisnap-surface p-4 border border-border"
              >
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Upload</span>
              </button>
              <button
                onClick={() => limitReached ? setUpgradeOpen(true) : galleryRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-nutrisnap-surface p-4 border border-border"
              >
                <ImageIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Galeria</span>
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 border border-primary/20">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-foreground/80">
                {user && plan === "free"
                  ? `${todayCount}/${FREE_DAILY_LIMIT} scan usado hoje • Plano Gratuito`
                  : "Resultado em menos de 3 segundos com IA"}
              </p>
            </div>

            {!user && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Faça login para salvar suas refeições</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={image} alt="Prato" className="w-full aspect-[4/3] object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm font-medium text-foreground">Analisando com IA...</p>
                </div>
              )}
            </div>

            {result && (
              <NutritionResult
                foods={result.foods}
                healthScore={result.healthScore}
                suggestions={result.suggestions}
                onDone={saveMeal}
                onAdjust={() => {}}
              />
            )}

            {!analyzing && !result && (
              <button onClick={resetScan} className="w-full rounded-xl bg-secondary p-3 text-sm font-medium text-foreground">
                Tirar outra foto
              </button>
            )}
          </div>
        )}
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
