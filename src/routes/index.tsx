import { createFileRoute } from "@tanstack/react-router";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroCard } from "@/components/MacroCard";
import { MealCard } from "@/components/MealCard";
import { Bell, Flame, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const consumed = 750;
  const goal = 2000;

  const meals = [
    { name: "Caesar Salad", time: "9:00am", calories: 133, protein: 12, carbs: 10, fat: 5 },
    { name: "Arroz com Feijão e Frango", time: "12:30pm", calories: 455, protein: 25, carbs: 55, fat: 15 },
    { name: "Iogurte com Granola", time: "3:00pm", calories: 162, protein: 8, carbs: 22, fat: 6 },
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
          <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <span className="text-sm font-semibold text-foreground">15</span>
            <span className="text-sm">🔥</span>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 mt-4">
        <div className="flex gap-3 mb-6">
          <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
            Hoje
          </button>
          <button className="rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Ontem
          </button>
        </div>

        <div className="rounded-2xl bg-nutrisnap-surface p-5 border border-border">
          <div className="flex items-center justify-between">
            <CalorieRing consumed={consumed} goal={goal} />
            <div className="flex flex-col gap-4">
              <MacroCard label="Proteína" value={45} unit="g" color="var(--color-nutrisnap-red)" goal={120} />
              <MacroCard label="Carbs" value={87} unit="g" color="var(--color-primary)" goal={250} />
              <MacroCard label="Gorduras" value={26} unit="g" color="var(--color-nutrisnap-blue)" goal={65} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Refeições recentes</h2>
          <div className="space-y-3">
            {meals.map((meal, i) => (
              <MealCard key={i} {...meal} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
