import { Flame, Drumstick } from "lucide-react";

interface MealCardProps {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

export function MealCard({ name, time, calories, protein, carbs, fat, imageUrl }: MealCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-3 border border-border">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Drumstick className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Flame className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium text-primary">{calories} kcal</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-nutrisnap-red" />
            {protein}g
          </span>
          <span className="flex items-center gap-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-nutrisnap-orange" />
            {carbs}g
          </span>
          <span className="flex items-center gap-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-nutrisnap-blue" />
            {fat}g
          </span>
        </div>
      </div>
    </div>
  );
}
