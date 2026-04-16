import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Bell, BellOff, Flame, Trophy, TrendingUp, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [settings, setSettings] = useState({
    dailyReminder: true,
    weeklyReport: true,
    goalReached: true,
    tips: false,
    promotions: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notifications = [
    { icon: Flame, title: "Lembrete diário", desc: "Lembre de registrar suas refeições", key: "dailyReminder" as const },
    { icon: TrendingUp, title: "Relatório semanal", desc: "Resumo da sua semana nutricional", key: "weeklyReport" as const },
    { icon: Trophy, title: "Metas atingidas", desc: "Aviso quando atingir sua meta diária", key: "goalReached" as const },
    { icon: Info, title: "Dicas de nutrição", desc: "Dicas personalizadas baseadas nos seus dados", key: "tips" as const },
    { icon: Bell, title: "Promoções", desc: "Ofertas e novidades do CaloriaX AI", key: "promotions" as const },
  ];

  const allOff = Object.values(settings).every((v) => !v);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/settings">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground font-display">Notificações</h1>
      </header>

      <div className="px-5 space-y-6">
        {allOff && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
            <BellOff className="h-5 w-5 text-destructive" />
            <p className="text-xs text-destructive">Todas as notificações estão desativadas</p>
          </div>
        )}

        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Configurar notificações</h2>
          <div className="rounded-xl bg-nutrisnap-surface border border-border overflow-hidden divide-y divide-border">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.key} className="flex items-center gap-3 p-4">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{n.title}</p>
                    <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch checked={settings[n.key]} onCheckedChange={() => toggle(n.key)} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-nutrisnap-surface border border-border p-4">
          <p className="text-xs text-muted-foreground text-center">
            As notificações push serão implementadas em breve. Por enquanto, as configurações são salvas localmente.
          </p>
        </div>
      </div>
    </div>
  );
}
