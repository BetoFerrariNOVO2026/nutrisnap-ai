import { createFileRoute } from "@tanstack/react-router";
import { MealCard } from "@/components/MealCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/meals")({
  component: MealsPage,
});

interface Meal {
  id: string;
  name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  scanned_at: string;
}

function MealsPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMeals = async () => {
      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .order("scanned_at", { ascending: false })
        .limit(50);

      setMeals((data as Meal[]) || []);
      setLoading(false);
    };

    fetchMeals();
  }, [user]);

  // Group meals by day
  const grouped = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const day = format(new Date(meal.scanned_at), "dd/MM/yyyy");
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  const today = format(new Date(), "dd/MM/yyyy");

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Refeições</h1>
        <p className="text-xs text-muted-foreground mt-1">Histórico de refeições registradas</p>
      </header>

      <div className="px-5 space-y-6">
        {!user ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground mb-3">Faça login para ver suas refeições</p>
            <Link to="/login" className="text-sm font-semibold text-primary">Entrar →</Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground mb-3">Nenhuma refeição registrada ainda</p>
            <Link to="/scan" className="text-sm font-semibold text-primary">Escanear prato →</Link>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dayMeals]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {date === today ? "Hoje" : date}
                </h2>
                <span className="text-xs text-primary font-medium">
                  {Math.round(dayMeals.reduce((a, m) => a + Number(m.total_calories), 0))} kcal
                </span>
              </div>
              <div className="space-y-3">
                {dayMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    name={meal.name}
                    time={format(new Date(meal.scanned_at), "HH:mm")}
                    calories={Number(meal.total_calories)}
                    protein={Number(meal.total_protein)}
                    carbs={Number(meal.total_carbs)}
                    fat={Number(meal.total_fat)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
