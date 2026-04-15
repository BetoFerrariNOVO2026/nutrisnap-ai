import { createFileRoute } from "@tanstack/react-router";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroCard } from "@/components/MacroCard";
import { MealCard } from "@/components/MealCard";
import { Bell, Flame, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface Meal {
  id: string;
  name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  scanned_at: string;
  image_url: string | null;
}

interface Profile {
  daily_calorie_goal: number | null;
  goal: string | null;
}

type DateFilter = "hoje" | "ontem" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

const weekDayLabels: { key: DateFilter; label: string }[] = [
  { key: "dom", label: "Dom" },
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
];

function getDateForFilter(filter: DateFilter): Date {
  const now = new Date();
  if (filter === "hoje") return now;
  if (filter === "ontem") return subDays(now, 1);

  const weekDayMap: Record<string, number> = {
    dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
  };
  const targetDay = weekDayMap[filter];
  const currentDay = now.getDay();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const target = new Date(weekStart);
  target.setDate(weekStart.getDate() + targetDay);
  return target;
}

function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<DateFilter>("hoje");
  const [loading, setLoading] = useState(true);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("daily_calorie_goal, goal")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, [user]);

  // Fetch meals for the whole week
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

    supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("scanned_at", startOfDay(weekStart).toISOString())
      .lte("scanned_at", endOfDay(weekEnd).toISOString())
      .order("scanned_at", { ascending: false })
      .then(({ data }) => {
        setMeals((data as Meal[]) || []);
        setLoading(false);
      });
  }, [user]);

  // Filter meals by selected date
  const filteredMeals = useMemo(() => {
    const targetDate = getDateForFilter(filter);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);
    return meals.filter((m) => {
      const d = new Date(m.scanned_at);
      return d >= dayStart && d <= dayEnd;
    });
  }, [meals, filter]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + Number(m.total_calories || 0),
        protein: acc.protein + Number(m.total_protein || 0),
        carbs: acc.carbs + Number(m.total_carbs || 0),
        fat: acc.fat + Number(m.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filteredMeals]);

  const goal = profile?.daily_calorie_goal || 2000;

  // Build filter buttons: Hoje, Ontem + week days
  const todayIndex = new Date().getDay();
  const filters: { key: DateFilter; label: string }[] = [
    { key: "hoje", label: "Hoje" },
    { key: "ontem", label: "Ontem" },
    ...weekDayLabels.filter((_, i) => i !== todayIndex && i !== ((todayIndex - 1 + 7) % 7)),
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-orange">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground font-display">NutriSnap AI</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 mt-4">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-nutrisnap-surface p-5 border border-border">
          <div className="flex items-center justify-between">
            <CalorieRing consumed={Math.round(totals.calories)} goal={goal} />
            <div className="flex flex-col gap-4">
              <MacroCard label="Proteína" value={Math.round(totals.protein)} unit="g" color="var(--color-nutrisnap-red)" goal={120} />
              <MacroCard label="Carbs" value={Math.round(totals.carbs)} unit="g" color="var(--color-primary)" goal={250} />
              <MacroCard label="Gorduras" value={Math.round(totals.fat)} unit="g" color="var(--color-nutrisnap-blue)" goal={65} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Refeições recentes</h2>
          <div className="space-y-3">
            {!user ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">Faça login para ver seus dados</p>
                <Link to="/login" className="text-sm font-semibold text-primary">Entrar →</Link>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filteredMeals.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">Nenhuma refeição registrada neste dia</p>
            ) : (
              filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  name={meal.name}
                  time={format(new Date(meal.scanned_at), "HH:mm")}
                  calories={Number(meal.total_calories)}
                  protein={Number(meal.total_protein)}
                  carbs={Number(meal.total_carbs)}
                  fat={Number(meal.total_fat)}
                  imageUrl={meal.image_url || undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
