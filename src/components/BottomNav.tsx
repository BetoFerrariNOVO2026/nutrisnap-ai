import { Link, useLocation } from "@tanstack/react-router";
import { Home, UtensilsCrossed, BarChart3, Settings, Camera } from "lucide-react";

type NavItem = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isCenter?: boolean;
};

const navItems: NavItem[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/meals", icon: UtensilsCrossed, label: "Meal" },
  { to: "/scan", icon: Camera, label: "", isCenter: true },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-neutral-800">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pb-5 pt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link key={item.to} to={item.to as "/"} className="-mt-6 flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 scan-pulse">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
