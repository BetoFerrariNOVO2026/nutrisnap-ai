import { Link, useLocation } from "@tanstack/react-router";
import { Users, CreditCard, LayoutDashboard, ArrowLeft, Webhook } from "lucide-react";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Usuários" },
  { to: "/admin/webhooks", icon: Webhook, label: "Webhooks" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-nutrisnap-surface border-r border-border min-h-screen">
      <div className="p-5 border-b border-border">
        <h2 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Área Admin
        </h2>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to as "/"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao app
        </Link>
      </div>
    </aside>
  );
}
