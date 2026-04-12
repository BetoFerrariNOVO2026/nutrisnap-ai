import { Flame, Beef, Wheat, Droplets, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

interface NutritionResultProps {
  foods: FoodItem[];
  healthScore: number;
  suggestions: string[];
  onDone: () => void;
  onAdjust: () => void;
}

export function NutritionResult({ foods, healthScore, suggestions, onDone, onAdjust }: NutritionResultProps) {
  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {foods.map((food, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-nutrisnap-surface p-3 border border-border">
            <span className="text-sm font-medium text-foreground">{food.name}</span>
            <span className="text-xs text-muted-foreground">{food.portion}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totals.calories}</p>
            <p className="text-[10px] text-muted-foreground">Calorias</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nutrisnap-green/20">
            <Wheat className="h-4 w-4 text-nutrisnap-green" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totals.carbs}g</p>
            <p className="text-[10px] text-muted-foreground">Carboidratos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nutrisnap-red/20">
            <Beef className="h-4 w-4 text-nutrisnap-red" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totals.protein}g</p>
            <p className="text-[10px] text-muted-foreground">Proteína</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nutrisnap-blue/20">
            <Droplets className="h-4 w-4 text-nutrisnap-blue" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totals.fat}g</p>
            <p className="text-[10px] text-muted-foreground">Gorduras</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-nutrisnap-surface p-4 border border-border">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-nutrisnap-red" />
          <span className="text-sm font-medium text-foreground">Health Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-nutrisnap-green transition-all"
              style={{ width: `${healthScore * 10}%` }}
            />
          </div>
          <span className="text-sm font-bold text-foreground">{healthScore}/10</span>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-xl bg-primary/10 p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Sugestões</span>
          </div>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-xs text-foreground/80">• {s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onAdjust}>
          <Sparkles className="h-4 w-4" />
          Ajustar
        </Button>
        <Button className="flex-1" onClick={onDone}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
