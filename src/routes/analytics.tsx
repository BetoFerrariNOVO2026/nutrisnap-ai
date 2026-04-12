import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Trophy, TrendingUp, Target } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const weekData = [
  { day: "Seg", cals: 1850 },
  { day: "Ter", cals: 2100 },
  { day: "Qua", cals: 1600 },
  { day: "Qui", cals: 1950 },
  { day: "Sex", cals: 2200 },
  { day: "Sáb", cals: 1400 },
  { day: "Dom", cals: 750 },
];

function AnalyticsPage() {
  const periods = ["1s", "1m", "3m", "6m", "1a"];
  const macros = ["Calorias", "Proteína", "Carbs", "Gorduras"];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Analytics</h1>
      </header>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3">Consistência Semanal</h2>
          
          <div className="flex gap-2 mb-3">
            {periods.map((p) => (
              <button
                key={p}
                className={`rounded-full px-3 py-1 text-xs font-medium ${p === "1s" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            {macros.map((m, i) => (
              <button
                key={m}
                className={`rounded-full px-3 py-1 text-xs font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {m}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Bar dataKey="cals" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Meta alcançada</p>
              <p className="text-xs text-muted-foreground">5 de 7 dias</p>
            </div>
            <span className="text-lg font-bold text-primary">71%</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nutrisnap-green/20">
              <TrendingUp className="h-5 w-5 text-nutrisnap-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Média diária</p>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
            <span className="text-lg font-bold text-foreground">1,836</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-nutrisnap-surface p-4 border border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nutrisnap-blue/20">
              <Target className="h-5 w-5 text-nutrisnap-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Sua meta</p>
              <p className="text-xs text-muted-foreground">Emagrecer</p>
            </div>
            <span className="text-lg font-bold text-foreground">2,000</span>
          </div>
        </div>

        <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
          <h2 className="text-sm font-semibold text-foreground mb-2">Seu IMC</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nutrisnap-green/20">
              <span className="text-lg font-bold text-nutrisnap-green">19.8</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">IMC Saudável</p>
              <div className="mt-2 h-2 w-full rounded-full overflow-hidden bg-muted">
                <div className="h-full rounded-full" style={{
                  width: "40%",
                  background: "linear-gradient(90deg, var(--color-nutrisnap-blue), var(--color-nutrisnap-green), var(--color-nutrisnap-orange), var(--color-nutrisnap-red))"
                }} />
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                <span>Abaixo</span>
                <span>Saudável</span>
                <span>Acima</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
