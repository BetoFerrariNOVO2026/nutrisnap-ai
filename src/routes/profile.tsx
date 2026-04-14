import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    goal: "maintain",
    weight: "",
    height: "",
    daily_calorie_goal: "2000",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name || "",
            goal: data.goal || "maintain",
            weight: data.weight?.toString() || "",
            height: data.height?.toString() || "",
            daily_calorie_goal: data.daily_calorie_goal?.toString() || "2000",
            phone: data.phone || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name || null,
        goal: form.goal,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
        daily_calorie_goal: form.daily_calorie_goal ? parseInt(form.daily_calorie_goal) : 2000,
        phone: form.phone || null,
      })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado!");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const goals = [
    { value: "lose", label: "Emagrecer" },
    { value: "maintain", label: "Manter peso" },
    { value: "gain", label: "Ganhar massa" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/settings" })} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground font-display">Editar Perfil</h1>
      </header>

      <div className="px-5 space-y-4">
        <Field label="E-mail" value={user?.email || ""} disabled />
        <Field label="Nome" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} />
        <Field label="Celular" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+55 11 99999-9999" />

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Objetivo</label>
          <div className="grid grid-cols-3 gap-2">
            {goals.map((g) => (
              <button
                key={g.value}
                onClick={() => setForm({ ...form, goal: g.value })}
                className={`rounded-xl px-3 py-2.5 text-xs font-medium border transition-colors ${
                  form.goal === g.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-nutrisnap-surface border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso (kg)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} type="number" />
          <Field label="Altura (cm)" value={form.height} onChange={(v) => setForm({ ...form, height: v })} type="number" />
        </div>

        <Field
          label="Meta calórica diária (kcal)"
          value={form.daily_calorie_goal}
          onChange={(v) => setForm({ ...form, daily_calorie_goal: v })}
          type="number"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl bg-nutrisnap-surface border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
