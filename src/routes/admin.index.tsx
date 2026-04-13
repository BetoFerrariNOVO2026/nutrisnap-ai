import { createFileRoute } from "@tanstack/react-router";
import { Users, Crown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, free: 0, pro: 0, premium: 0 });

  useEffect(() => {
    supabase
      .from("profiles")
      .select("subscription_plan")
      .then(({ data }) => {
        if (!data) return;
        setStats({
          total: data.length,
          free: data.filter((p: any) => p.subscription_plan === "free").length,
          pro: data.filter((p: any) => p.subscription_plan === "pro").length,
          premium: data.filter((p: any) => p.subscription_plan === "premium").length,
        });
      });
  }, []);

  const cards = [
    { label: "Total de usuários", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Plano Gratuito", value: stats.free, icon: Users, color: "text-muted-foreground" },
    { label: "Plano PRO", value: stats.pro, icon: Crown, color: "text-nutrisnap-green" },
    { label: "Plano Premium", value: stats.premium, icon: TrendingUp, color: "text-chart-1" },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-6 font-display">Dashboard Admin</h1>
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
    </div>
  );
}
