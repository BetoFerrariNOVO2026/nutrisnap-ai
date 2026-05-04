import { Flame, Drumstick, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MealCardProps {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  onDelete?: () => void | Promise<void>;
}

export function MealCard({ name, time, calories, protein, carbs, fat, imageUrl, onDelete }: MealCardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-3 border border-border">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Drumstick className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">{time}</span>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    aria-label="Excluir refeição"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir refeição?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir "{name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete()} className="bg-destructive hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
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
