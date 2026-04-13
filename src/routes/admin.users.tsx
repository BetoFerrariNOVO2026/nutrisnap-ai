import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  subscription_plan: string;
  created_at: string;
  email?: string;
}

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (profiles) {
      // Get emails from auth - we'll use display_name as fallback
      setUsers(profiles as UserProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_plan: newPlan })
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao atualizar plano");
    } else {
      toast.success("Plano atualizado com sucesso!");
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, subscription_plan: newPlan } : u))
      );
    }
    setUpdatingId(null);
  };

  const filtered = users.filter(
    (u) =>
      (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search)
  );

  const planBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Badge className="bg-nutrisnap-green/20 text-nutrisnap-green border-nutrisnap-green/30">PRO</Badge>;
      case "premium":
        return <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">Premium</Badge>;
      default:
        return <Badge variant="secondary">Gratuito</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Usuários
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{users.length} usuários cadastrados</p>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-nutrisnap-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-nutrisnap-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Telefone</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="hidden md:table-cell">Cadastro</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.display_name || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{user.phone || "—"}</span>
                  </TableCell>
                  <TableCell>{planBadge(user.subscription_plan)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.subscription_plan}
                      onValueChange={(val) => handlePlanChange(user.user_id, val)}
                      disabled={updatingId === user.user_id}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Gratuito</SelectItem>
                        <SelectItem value="pro">PRO</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
