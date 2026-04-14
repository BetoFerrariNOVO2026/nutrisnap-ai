import { createFileRoute } from "@tanstack/react-router";
import { Users, Crown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
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
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, free: 0, pro: 0, premium: 0 });
  const [signupData, setSignupData] = useState<{ date: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => {
    // Fetch user stats
    supabase
      .from("profiles")
      .select("subscription_plan, created_at")
      .then(({ data }) => {
        if (!data) return;
        setStats({
          total: data.length,
          free: data.filter((p: any) => p.subscription_plan === "free").length,
          pro: data.filter((p: any) => p.subscription_plan === "pro").length,
          premium: data.filter((p: any) => p.subscription_plan === "premium").length,
        });

        // Signups per day (last 14 days)
        const days: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = format(subDays(new Date(), i), "yyyy-MM-dd");
          days[d] = 0;
        }
        data.forEach((p: any) => {
          const d = p.created_at?.slice(0, 10);
          if (d && days[d] !== undefined) days[d]++;
        });
        setSignupData(
          Object.entries(days).map(([date, count]) => ({
            date: format(parseISO(date), "dd/MM", { locale: ptBR }),
            count,
          }))
        );

        // Revenue per month (pro=19.90, premium=39.90)
        const months: Record<string, number> = {};
        data.forEach((p: any) => {
          if (p.subscription_plan === "free") return;
          const m = p.created_at?.slice(0, 7);
          if (!m) return;
          const value = p.subscription_plan === "pro" ? 19.9 : 39.9;
          months[m] = (months[m] || 0) + value;
        });
        const sortedMonths = Object.entries(months)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, revenue]) => ({
            month: format(parseISO(month + "-01"), "MMM/yy", { locale: ptBR }),
            revenue: Math.round(revenue * 100) / 100,
          }));
        setRevenueData(sortedMonths);
      });
  }, []);

  const cards = [
    { label: "Total de usuários", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Plano Gratuito", value: stats.free, icon: Users, color: "text-muted-foreground" },
    { label: "Plano PRO", value: stats.pro, icon: Crown, color: "text-nutrisnap-green" },
    { label: "Plano Premium", value: stats.premium, icon: TrendingUp, color: "text-chart-1" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-xl font-bold text-foreground font-display">Dashboard Admin</h1>

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

      {/* Signups chart */}
      <div className="rounded-2xl bg-nutrisnap-surface border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Cadastros por dia (últimos 14 dias)</h2>
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
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-nutrisnap-surface border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Receita mensal (R$)</h2>
        {revenueData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma receita registrada ainda.</p>
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
