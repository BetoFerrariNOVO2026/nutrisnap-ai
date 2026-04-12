import { createFileRoute } from "@tanstack/react-router";
import { MealCard } from "@/components/MealCard";

export const Route = createFileRoute("/meals")({
  component: MealsPage,
});

const mealsByDay = [
  {
    date: "Hoje",
    totalCals: 750,
    meals: [
      { name: "Caesar Salad", time: "9:00am", calories: 133, protein: 12, carbs: 10, fat: 5 },
      { name: "Arroz com Feijão e Frango", time: "12:30pm", calories: 455, protein: 25, carbs: 55, fat: 15 },
      { name: "Iogurte com Granola", time: "3:00pm", calories: 162, protein: 8, carbs: 22, fat: 6 },
    ],
  },
  {
    date: "Ontem",
    totalCals: 1830,
    meals: [
      { name: "Pão com Ovo", time: "8:00am", calories: 280, protein: 14, carbs: 30, fat: 12 },
      { name: "Macarrão ao Molho", time: "1:00pm", calories: 620, protein: 18, carbs: 85, fat: 15 },
      { name: "Açaí com Banana", time: "4:00pm", calories: 350, protein: 5, carbs: 65, fat: 8 },
      { name: "Sopa de Legumes", time: "7:30pm", calories: 180, protein: 6, carbs: 25, fat: 4 },
    ],
  },
];

function MealsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Refeições</h1>
        <p className="text-xs text-muted-foreground mt-1">Histórico de refeições registradas</p>
      </header>

      <div className="px-5 space-y-6">
        {mealsByDay.map((day) => (
          <div key={day.date}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">{day.date}</h2>
              <span className="text-xs text-primary font-medium">{day.totalCals} kcal</span>
            </div>
            <div className="space-y-3">
              {day.meals.map((meal, i) => (
                <MealCard key={i} {...meal} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
