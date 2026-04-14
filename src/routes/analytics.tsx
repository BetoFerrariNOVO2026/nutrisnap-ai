import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { startOfWeek, endOfWeek, startOfDay, endOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

interface Meal {
  id: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  scanned_at: string;
}

interface Profile {
  daily_calorie_goal: number | null;
  goal: string | null;
  weight: number | null;
  height: number | null;
}

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function AnalyticsPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

    const fetchData = async () => {
      const [mealsRes, profileRes] = await Promise.all([
        supabase
          .from("meals")
          .select("id, total_calories, total_protein, total_carbs, total_fat, scanned_at")
          .eq("user_id", user.id)
          .gte("scanned_at", startOfDay(weekStart).toISOString())
          .lte("scanned_at", endOfDay(weekEnd).toISOString())
          .order("scanned_at", { ascending: true }),
        supabase
          .from("profiles")
          .select("daily_calorie_goal, goal, weight, height")
          .eq("user_id", user.id)
          .single(),
      ]);

      setMeals((mealsRes.data as Meal[]) || []);
      if (profileRes.data) setProfile(profileRes.data as Profile);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Group meals by day of week
  const weekData = useMemo(() => {
    const data = dayLabels.map((day) => ({ day, cals: 0 }));
    meals.forEach((m) => {
      const dayIndex = new Date(m.scanned_at).getDay();
      data[dayIndex].cals += Number(m.total_calories || 0);
    });
    return data.map((d) => ({ ...d, cals: Math.round(d.cals) }));
  }, [meals]);

  const goal = profile?.daily_calorie_goal || 2000;

  // Days that met calorie goal
  const daysMetGoal = weekData.filter((d) => d.cals > 0 && d.cals <= goal * 1.1 && d.cals >= goal * 0.5).length;
  const daysWithData = weekData.filter((d) => d.cals > 0).length;
  const goalPercent = daysWithData > 0 ? Math.round((daysMetGoal / 7) * 100) : 0;

  // Average daily calories
  const avgCalories = daysWithData > 0 ? Math.round(weekData.reduce((a, d) => a + d.cals, 0) / daysWithData) : 0;

  // BMI
  const weight = profile?.weight || 0;
  const heightM = (profile?.height || 0) / 100;
  const bmi = heightM > 0 ? (weight / (heightM * heightM)) : 0;
  const bmiRounded = Math.round(bmi * 10) / 10;
  const bmiLabel = bmi < 18.5 ? "Abaixo do peso" : bmi < 25 ? "IMC Saudável" : bmi < 30 ? "Sobrepeso" : "Obesidade";
  const bmiPercent = Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 5), 95);

  const goalLabel = profile?.goal === "lose" ? "Emagrecer" : profile?.goal === "gain" ? "Ganhar massa" : profile?.goal === "maintain" ? "Manter peso" : profile?.goal || "—";

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Faça login para ver seus dados</p>
          <Link to="/login" className="text-sm font-semibold text-primary">Entrar →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Analytics</h1>
      </header>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3">Consumo Semanal (kcal)</h2>

          {loading ? (
            <div className="flex items-center justify-center h-[180px]">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Bar dataKey="cals" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Meta alcançada</p>
              <p className="text-xs text-muted-foreground">{daysMetGoal} de 7 dias</p>
            </div>
            <span className="text-lg font-bold text-primary">{goalPercent}%</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nutrisnap-green/20">
              <TrendingUp className="h-5 w-5 text-nutrisnap-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Média diária</p>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
            <span className="text-lg font-bold text-foreground">{avgCalories.toLocaleString("pt-BR")}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nutrisnap-blue/20">
              <Target className="h-5 w-5 text-nutrisnap-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Sua meta</p>
              <p className="text-xs text-muted-foreground">{goalLabel}</p>
            </div>
            <span className="text-lg font-bold text-foreground">{goal.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {weight > 0 && heightM > 0 && (
          <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
            <h2 className="text-sm font-semibold text-foreground mb-2">Seu IMC</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nutrisnap-green/20">
                <span className="text-lg font-bold text-nutrisnap-green">{bmiRounded}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{bmiLabel}</p>
                <div className="mt-2 h-2 w-full rounded-full overflow-hidden bg-muted">
                  <div className="h-full rounded-full" style={{
                    width: `${bmiPercent}%`,
                    background: "linear-gradient(90deg, var(--color-nutrisnap-blue), var(--color-nutrisnap-green), var(--color-nutrisnap-orange), var(--color-nutrisnap-red))"
                  }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                  <span>Abaixo</span>
                  <span>Saudável</span>
                  <span>Acima</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
