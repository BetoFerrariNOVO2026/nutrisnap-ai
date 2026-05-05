import { createFileRoute } from "@tanstack/react-router";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroCard } from "@/components/MacroCard";
import { MealCard } from "@/components/MealCard";
import { Bell, Flame, Sun, Moon, ChevronDown, Calendar as CalendarIcon, ChefHat, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR, enUS, es as esLocale } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
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

type DateFilter = "hoje" | "ontem" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom" | "custom";

const weekDayKeys: { key: DateFilter; tKey: "weekSun" | "weekMon" | "weekTue" | "weekWed" | "weekThu" | "weekFri" | "weekSat" }[] = [
  { key: "dom", tKey: "weekSun" },
  { key: "seg", tKey: "weekMon" },
  { key: "ter", tKey: "weekTue" },
  { key: "qua", tKey: "weekWed" },
  { key: "qui", tKey: "weekThu" },
  { key: "sex", tKey: "weekFri" },
  { key: "sab", tKey: "weekSat" },
];

function getDateForFilter(filter: DateFilter, customDate?: Date): Date {
  if (filter === "custom" && customDate) return customDate;
  const now = new Date();
  if (filter === "hoje") return now;
  if (filter === "ontem") return subDays(now, 1);

  const weekDayMap: Record<string, number> = {
    dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
  };
  const targetDay = weekDayMap[filter];
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const target = new Date(weekStart);
  target.setDate(weekStart.getDate() + targetDay);
  return target;
}

function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const dateLocale = lang === "pt" ? ptBR : lang === "es" ? esLocale : enUS;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<DateFilter>("hoje");
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
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

  const handleDeleteMeal = async (id: string) => {
    const prev = meals;
    setMeals((m) => m.filter((x) => x.id !== id));
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) setMeals(prev);
  };

  // Filter meals by selected date
  const filteredMeals = useMemo(() => {
    const targetDate = getDateForFilter(filter, filter === "custom" ? customDate : undefined);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);
    return meals.filter((m) => {
      const d = new Date(m.scanned_at);
      return d >= dayStart && d <= dayEnd;
    });
  }, [meals, filter, customDate]);

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

  const filterLabel = filter === "custom"
    ? format(customDate, "dd/MM/yyyy", { locale: dateLocale })
    : filter === "hoje" ? t("filterToday")
    : filter === "ontem" ? t("filterYesterday")
    : t(weekDayKeys.find(w => w.key === filter)!.tKey);

  const allFilters: { key: DateFilter; label: string }[] = [
    { key: "hoje", label: t("filterToday") },
    { key: "ontem", label: t("filterYesterday") },
    ...weekDayKeys.map((w) => ({ key: w.key, label: t(w.tKey) })),
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-orange">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground font-display">CaloriaX AI</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 mt-4">
        {/* Collapsible Date Filter */}
        <div className="mb-6">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full flex items-center justify-between rounded-xl bg-nutrisnap-surface border border-border px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{filterLabel}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>

          {filterOpen && (
            <div className="mt-2 rounded-xl bg-nutrisnap-surface border border-border p-3 space-y-1">
              {allFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {f.label}
                </button>
              ))}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                      filter === "custom"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {filter === "custom"
                      ? format(customDate, "dd/MM/yyyy", { locale: dateLocale })
                      : t("filterCustom")}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={dateLocale}
                    selected={customDate}
                    onSelect={(d) => {
                      if (d) {
                        setCustomDate(d);
                        setFilter("custom");
                        setCalendarOpen(false);
                        setFilterOpen(false);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
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

        <Link to="/recipes" className="mt-6 block group">
          <div className="rounded-2xl gradient-orange p-4 border border-primary/30 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-primary-foreground">{t("recipesCardTitle")}</h3>
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <p className="text-xs text-primary-foreground/85 mt-0.5">{t("recipesCardDesc")}</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">{t("recentMeals")}</h2>
          <div className="space-y-3">
            {!user ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">{t("loginToSee")}</p>
                <Link to="/login" className="text-sm font-semibold text-primary">{t("login")} →</Link>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filteredMeals.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">{t("noMealsDay")}</p>
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
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
