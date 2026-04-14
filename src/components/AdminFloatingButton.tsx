import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";

export function AdminFloatingButton() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  if (!user || loading || !isAdmin) return null;

  return (
    <Link
      to="/admin"
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
    >
      <Shield className="h-4 w-4" />
      <span className="hidden sm:inline">Área Admin</span>
    </Link>
  );
}
