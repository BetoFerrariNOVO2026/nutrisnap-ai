import { createFileRoute } from "@tanstack/react-router";
import { User, Target, Scale, Ruler, Crown, ChevronRight, LogOut, Moon, Bell, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const profile = {
    name: "Maria Silva",
    goal: "Emagrecer",
    weight: 65,
    height: 165,
    dailyGoal: 2000,
  };

  const settingsGroups = [
    {
      title: "Perfil",
      items: [
        { icon: User, label: "Dados pessoais", value: profile.name },
        { icon: Target, label: "Objetivo", value: profile.goal },
        { icon: Scale, label: "Peso atual", value: `${profile.weight} kg` },
        { icon: Ruler, label: "Altura", value: `${profile.height} cm` },
      ],
    },
    {
      title: "Preferências",
      items: [
        { icon: Bell, label: "Notificações", value: "Ativado" },
        { icon: Moon, label: "Tema escuro", value: "Ativado" },
      ],
    },
    {
      title: "Conta",
      items: [
        { icon: Crown, label: "Plano", value: "Gratuito" },
        { icon: HelpCircle, label: "Ajuda", value: "" },
        { icon: LogOut, label: "Sair", value: "" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Configurações</h1>
      </header>

      <div className="px-5 space-y-6">
        {/* PRO Banner */}
        <div className="rounded-2xl gradient-orange p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-primary-foreground" />
              <h2 className="text-sm font-bold text-primary-foreground">NutriSnap PRO</h2>
            </div>
            <p className="text-xs text-primary-foreground/80">Scans ilimitados, análise avançada e sugestões personalizadas</p>
            <button className="mt-3 rounded-full bg-primary-foreground px-4 py-1.5 text-xs font-bold text-primary">
              Assinar agora
            </button>
          </div>
        </div>

        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</h2>
            <div className="rounded-xl bg-nutrisnap-surface border border-border overflow-hidden divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} className="flex w-full items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left text-sm text-foreground">{item.label}</span>
                    {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
