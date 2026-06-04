import { createFileRoute } from "@tanstack/react-router";
import { Users, Crown, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  differenceInDays,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Preset = "today" | "yesterday" | "7d" | "14d" | "30d" | "thisMonth" | "lastMonth" | "thisYear" | "all" | "custom";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "14d", label: "Últimos 14 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "thisMonth", label: "Este mês" },
  { key: "lastMonth", label: "Mês passado" },
  { key: "thisYear", label: "Este ano" },
  { key: "all", label: "Todo o período" },
  { key: "custom", label: "Personalizado" },
];

function getRangeForPreset(preset: Preset, custom?: DateRange): { from: Date; to: Date } {
  const now = new Date();
  switch (preset) {
    case "today": return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": { const y = subDays(now, 1); return { from: startOfDay(y), to: endOfDay(y) }; }
    case "7d": return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "14d": return { from: startOfDay(subDays(now, 13)), to: endOfDay(now) };
    case "30d": return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "thisMonth": return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": { const lm = subDays(startOfMonth(now), 1); return { from: startOfMonth(lm), to: endOfMonth(lm) }; }
    case "thisYear": return { from: startOfYear(now), to: endOfYear(now) };
    case "all": return { from: new Date(2000, 0, 1), to: endOfDay(now) };
    case "custom": return {
      from: custom?.from ? startOfDay(custom.from) : startOfDay(subDays(now, 6)),
      to: custom?.to ? endOfDay(custom.to) : endOfDay(custom?.from ?? now),
    };
  }
}

function AdminDashboard() {
  const [profiles, setProfiles] = useState<{ subscription_plan: string; created_at: string }[]>([]);
  const [preset, setPreset] = useState<Preset>("14d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("subscription_plan, created_at")
      .then(({ data }) => setProfiles((data as any) || []));
  }, []);

  const range = useMemo(() => getRangeForPreset(preset, customRange), [preset, customRange]);

  const filtered = useMemo(
    () => profiles.filter((p) => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      return d >= range.from && d <= range.to;
    }),
    [profiles, range]
  );

  const stats = useMemo(() => ({
    total: filtered.length,
    free: filtered.filter((p) => p.subscription_plan === "free").length,
    start: filtered.filter((p) => p.subscription_plan === "start").length,
    pro: filtered.filter((p) => p.subscription_plan === "pro").length,
    premium: filtered.filter((p) => p.subscription_plan === "premium").length,
  }), [filtered]);

  const signupData = useMemo(() => {
    const days = differenceInDays(range.to, range.from);
    // Group by month if range > 60 days
    if (days > 60) {
      const months = eachMonthOfInterval({ start: range.from, end: range.to });
      const map: Record<string, number> = {};
      months.forEach((m) => { map[format(m, "yyyy-MM")] = 0; });
      filtered.forEach((p) => {
        const k = p.created_at?.slice(0, 7);
        if (k && map[k] !== undefined) map[k]++;
      });
      return Object.entries(map).map(([k, count]) => ({
        date: format(parseISO(k + "-01"), "MMM/yy", { locale: ptBR }),
        count,
      }));
    }
    const daysArr = eachDayOfInterval({ start: range.from, end: range.to });
    const map: Record<string, number> = {};
    daysArr.forEach((d) => { map[format(d, "yyyy-MM-dd")] = 0; });
    filtered.forEach((p) => {
      const k = p.created_at?.slice(0, 10);
      if (k && map[k] !== undefined) map[k]++;
    });
    return Object.entries(map).map(([k, count]) => ({
      date: format(parseISO(k), "dd/MM", { locale: ptBR }),
      count,
    }));
  }, [filtered, range]);

  const revenueData = useMemo(() => {
    const months: Record<string, number> = {};
    filtered.forEach((p) => {
      if (p.subscription_plan === "free") return;
      const m = p.created_at?.slice(0, 7);
      if (!m) return;
      const value = p.subscription_plan === "start" ? 9.9 : p.subscription_plan === "pro" ? 19.9 : 39.9;
      months[m] = (months[m] || 0) + value;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: format(parseISO(month + "-01"), "MMM/yy", { locale: ptBR }),
        revenue: Math.round(revenue * 100) / 100,
      }));
  }, [filtered]);

  const cards = [
    { label: "Total de usuários", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Plano Gratuito", value: stats.free, icon: Users, color: "text-muted-foreground" },
    { label: "Plano PRO", value: stats.pro, icon: Crown, color: "text-nutrisnap-green" },
    { label: "Plano Premium", value: stats.premium, icon: TrendingUp, color: "text-chart-1" },
  ];

  const rangeLabel = preset === "all"
    ? "Todo o período"
    : `${format(range.from, "dd/MM/yyyy", { locale: ptBR })} → ${format(range.to, "dd/MM/yyyy", { locale: ptBR })}`;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground font-display">Dashboard Admin</h1>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-sm">{PRESETS.find((p) => p.key === preset)?.label}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">· {rangeLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex flex-col sm:flex-row">
              <div className="flex flex-col p-2 border-b sm:border-b-0 sm:border-r border-border min-w-[180px]">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => {
                      setPreset(p.key);
                      if (p.key !== "custom") setPopoverOpen(false);
                    }}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      preset === p.key
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {preset === "custom" && (
                <div className="p-2">
                  <Calendar
                    mode="range"
                    locale={ptBR}
                    selected={customRange}
                    onSelect={(r) => {
                      setCustomRange(r);
                      if (r?.from && r?.to) setPopoverOpen(false);
                    }}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground sm:hidden">{rangeLabel}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl bg-nutrisnap-surface border border-border p-5">
              <Icon className={`h-5 w-5 ${card.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-nutrisnap-surface border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Cadastros no período</h2>
        {signupData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados para o período selecionado.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Cadastros" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl bg-nutrisnap-surface border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Receita mensal (R$)</h2>
        {revenueData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma receita registrada no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Receita"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--nutrisnap-green)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--nutrisnap-green)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
