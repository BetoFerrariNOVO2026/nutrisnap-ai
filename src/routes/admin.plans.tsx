import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Crown } from "lucide-react";

export const Route = createFileRoute("/admin/plans")({
  component: AdminPlansPage,
});

interface PlanRow {
  id: string;
  plan_key: string;
  sort_order: number;
  highlight: boolean;
  badge: string | null;
  card_link: string | null;
  pix_link: string | null;
  price_brl: string;
  price_usd: string;
  name_pt: string; name_en: string; name_es: string;
  desc_pt: string; desc_en: string; desc_es: string;
  cta_pt: string; cta_en: string; cta_es: string;
  features_pt: string[]; features_en: string[]; features_es: string[];
}

function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("plan_settings" as any)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    else setPlans((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (id: string, field: keyof PlanRow, value: any) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const save = async (plan: PlanRow) => {
    setSaving(plan.id);
    const { id, ...rest } = plan;
    const { error } = await supabase
      .from("plan_settings" as any)
      .update(rest)
      .eq("id", id);
    setSaving(null);
    if (error) toast.error(error.message);
    else toast.success(`Plano "${plan.name_pt}" salvo`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground font-display">Editar Planos</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Edite preços (R$ aparece para Português, US$ para Inglês/Espanhol), textos e benefícios em cada idioma.
      </p>

      {plans.map((p) => (
        <div key={p.id} className="rounded-2xl bg-nutrisnap-surface border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground uppercase">{p.plan_key}</h2>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Destacado</Label>
              <Switch
                checked={p.highlight}
                onCheckedChange={(v) => updateField(p.id, "highlight", v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Preço (Brasil — R$)</Label>
              <Input value={p.price_brl} onChange={(e) => updateField(p.id, "price_brl", e.target.value)} placeholder="R$ 19,90" />
            </div>
            <div>
              <Label className="text-xs">Preço (Internacional — US$)</Label>
              <Input value={p.price_usd} onChange={(e) => updateField(p.id, "price_usd", e.target.value)} placeholder="$3.99" />
            </div>
            <div>
              <Label className="text-xs">Badge (ex: MAIS POPULAR)</Label>
              <Input value={p.badge || ""} onChange={(e) => updateField(p.id, "badge", e.target.value || null)} />
            </div>
            <div>
              <Label className="text-xs">Link Cartão</Label>
              <Input value={p.card_link || ""} onChange={(e) => updateField(p.id, "card_link", e.target.value || null)} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Link PIX</Label>
              <Input value={p.pix_link || ""} onChange={(e) => updateField(p.id, "pix_link", e.target.value || null)} />
            </div>
          </div>

          {(["pt", "en", "es"] as const).map((lng) => {
            const labels = { pt: "🇧🇷 Português", en: "🇺🇸 Inglês", es: "🇪🇸 Espanhol" };
            const nameKey = `name_${lng}` as keyof PlanRow;
            const descKey = `desc_${lng}` as keyof PlanRow;
            const ctaKey = `cta_${lng}` as keyof PlanRow;
            const featKey = `features_${lng}` as keyof PlanRow;
            return (
              <div key={lng} className="rounded-xl border border-border p-4 space-y-3 bg-background/50">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">{labels[lng]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome</Label>
                    <Input value={p[nameKey] as string} onChange={(e) => updateField(p.id, nameKey, e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Texto do botão (CTA)</Label>
                    <Input value={p[ctaKey] as string} onChange={(e) => updateField(p.id, ctaKey, e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Input value={p[descKey] as string} onChange={(e) => updateField(p.id, descKey, e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Benefícios (um por linha)</Label>
                  <Textarea
                    rows={6}
                    value={(p[featKey] as string[]).join("\n")}
                    onChange={(e) => updateField(p.id, featKey, e.target.value.split("\n").filter((s) => s.length > 0))}
                  />
                </div>
              </div>
            );
          })}

          <Button onClick={() => save(p)} disabled={saving === p.id} className="w-full md:w-auto">
            {saving === p.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar plano
          </Button>
        </div>
      ))}
    </div>
  );
}
