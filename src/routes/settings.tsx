import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Target, Scale, Ruler, Crown, ChevronRight, LogOut, Moon, Sun, Bell, HelpCircle, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/useAdmin";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  const profile = {
    name: user?.email || "Visitante",
    goal: "Emagrecer",
    weight: 65,
    height: 165,
    dailyGoal: 2000,
  };

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/sales" });
  };

  const settingsGroups = [
    {
      title: "Perfil",
      items: [
        { icon: User, label: "Dados pessoais", value: profile.name, action: () => navigate({ to: "/profile" }) },
        { icon: Target, label: "Objetivo", value: profile.goal, action: () => navigate({ to: "/profile" }) },
        { icon: Scale, label: "Peso atual", value: `${profile.weight} kg`, action: () => navigate({ to: "/profile" }) },
        { icon: Ruler, label: "Altura", value: `${profile.height} cm`, action: () => navigate({ to: "/profile" }) },
      ],
    },
    {
      title: "Preferências",
      items: [
        { icon: Bell, label: "Notificações", value: "Ativado", action: undefined },
        {
          icon: theme === "dark" ? Moon : Sun,
          label: theme === "dark" ? "Tema escuro" : "Tema claro",
          value: theme === "dark" ? "Escuro" : "Claro",
          action: toggleTheme,
        },
      ],
    },
    {
      title: "Conta",
      items: [
        { icon: Crown, label: "Plano", value: "Gratuito", action: () => navigate({ to: "/pricing" }) },
        ...(isAdmin
          ? [{ icon: Shield, label: "Área Admin", value: "", action: () => navigate({ to: "/admin" }) }]
          : []),
        { icon: HelpCircle, label: "Ajuda", value: "", action: undefined },
        ...(user
          ? [{ icon: LogOut, label: "Sair", value: "", action: handleLogout }]
          : []),
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
        <Link to="/pricing">
          <div className="rounded-2xl gradient-orange p-4 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary-foreground" />
                <h2 className="text-sm font-bold text-primary-foreground">NutriSnap PRO</h2>
              </div>
              <p className="text-xs text-primary-foreground/80">Scans ilimitados, análise avançada e sugestões personalizadas</p>
              <span className="mt-3 inline-block rounded-full bg-primary-foreground px-4 py-1.5 text-xs font-bold text-primary">
                Assinar agora
              </span>
            </div>
          </div>
        </Link>

        {!user && (
          <Link to="/login">
            <div className="rounded-xl bg-primary/10 p-4 border border-primary/20 text-center">
              <p className="text-sm font-semibold text-primary">Faça login para acessar todas as configurações</p>
            </div>
          </Link>
        )}

        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</h2>
            <div className="rounded-xl bg-nutrisnap-surface border border-border overflow-hidden divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex w-full items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
                  >
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
