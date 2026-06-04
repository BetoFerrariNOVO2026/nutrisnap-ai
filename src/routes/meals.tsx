import { createFileRoute } from "@tanstack/react-router";
import { MealCard } from "@/components/MealCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Flame, UtensilsCrossed, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  image_url: string | null;
  health_score?: number | null;
  suggestions?: string[] | null;
}

interface MealFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string | null;
}

function MealsPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMeal, setViewMeal] = useState<Meal | null>(null);
  const [viewFoods, setViewFoods] = useState<MealFood[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [form, setForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [saving, setSaving] = useState(false);

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

  const handleDelete = async (id: string) => {
    const prev = meals;
    setMeals((m) => m.filter((x) => x.id !== id));
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) {
      setMeals(prev);
    }
  };

  const openView = async (meal: Meal) => {
    setViewMeal(meal);
    setViewFoods([]);
    setLoadingFoods(true);
    const { data } = await supabase
      .from("meal_foods")
      .select("*")
      .eq("meal_id", meal.id);
    setViewFoods((data as MealFood[]) || []);
    setLoadingFoods(false);
  };

  const openEdit = (meal: Meal) => {
    setEditMeal(meal);
    setForm({
      name: meal.name,
      calories: String(meal.total_calories ?? 0),
      protein: String(meal.total_protein ?? 0),
      carbs: String(meal.total_carbs ?? 0),
      fat: String(meal.total_fat ?? 0),
    });
  };

  const saveEdit = async () => {
    if (!editMeal) return;
    setSaving(true);
    const updates = {
      name: form.name.trim() || editMeal.name,
      total_calories: parseFloat(form.calories) || 0,
      total_protein: parseFloat(form.protein) || 0,
      total_carbs: parseFloat(form.carbs) || 0,
      total_fat: parseFloat(form.fat) || 0,
    };
    const { error } = await supabase.from("meals").update(updates).eq("id", editMeal.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar");
      return;
    }
    setMeals((prev) => prev.map((m) => (m.id === editMeal.id ? { ...m, ...updates } : m)));
    toast.success("Refeição atualizada");
    setEditMeal(null);
  };

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
                    imageUrl={meal.image_url || undefined}
                    onView={() => openView(meal)}
                    onEdit={() => openEdit(meal)}
                    onDelete={() => handleDelete(meal.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewMeal} onOpenChange={(o) => !o && setViewMeal(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da refeição</DialogTitle>
          </DialogHeader>
          {viewMeal && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
                {viewMeal.image_url ? (
                  <img src={viewMeal.image_url} alt={viewMeal.name} className="h-full w-full object-cover" />
                ) : (
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{viewMeal.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(viewMeal.scanned_at), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <Stat label="Kcal" value={`${Math.round(Number(viewMeal.total_calories))}`} icon={<Flame className="h-3.5 w-3.5 text-primary" />} />
                <Stat label="Proteína" value={`${Math.round(Number(viewMeal.total_protein))}g`} />
                <Stat label="Carbo" value={`${Math.round(Number(viewMeal.total_carbs))}g`} />
                <Stat label="Gordura" value={`${Math.round(Number(viewMeal.total_fat))}g`} />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alimentos</h4>
                {loadingFoods ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : viewFoods.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem alimentos detalhados.</p>
                ) : (
                  <ul className="space-y-2">
                    {viewFoods.map((f) => (
                      <li key={f.id} className="rounded-lg bg-nutrisnap-surface border border-border p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">{f.name}</p>
                            {f.portion && <p className="text-[11px] text-muted-foreground">{f.portion}</p>}
                          </div>
                          <span className="text-xs font-semibold text-primary shrink-0">{Math.round(Number(f.calories))} kcal</span>
                        </div>
                        <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                          <span>P {Math.round(Number(f.protein))}g</span>
                          <span>C {Math.round(Number(f.carbs))}g</span>
                          <span>G {Math.round(Number(f.fat))}g</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {viewMeal.suggestions && viewMeal.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sugestões</h4>
                  <ul className="space-y-1">
                    {viewMeal.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-foreground">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editMeal} onOpenChange={(o) => !o && setEditMeal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar refeição</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cal" className="text-xs">Calorias (kcal)</Label>
                <Input id="cal" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="prot" className="text-xs">Proteína (g)</Label>
                <Input id="prot" type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="carb" className="text-xs">Carboidrato (g)</Label>
                <Input id="carb" type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="fat" className="text-xs">Gordura (g)</Label>
                <Input id="fat" type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMeal(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-nutrisnap-surface border border-border p-2">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
