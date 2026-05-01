import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Webhook, Copy, CheckCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/webhooks")({
  component: AdminWebhooksPage,
});

function AdminWebhooksPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/public/webhook-receiver?platform=lowify`
      : "";

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_webhooks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) toast.error("Erro ao carregar webhooks");
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteOne = async (id: string) => {
    const { error } = await supabase.from("payment_webhooks").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast.success("Evento excluído");
  };

  const deleteAll = async () => {
    const { error } = await supabase
      .from("payment_webhooks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast.error("Erro ao excluir todos: " + error.message);
      return;
    }
    setLogs([]);
    toast.success("Todos os eventos foram excluídos");
  };

  const toggleExpand = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          Webhooks de Pagamento
        </h1>
        {logs.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="rounded-full">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Excluir todos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir todos os eventos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os {logs.length} registros de webhook serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAll}>Excluir tudo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="rounded-xl bg-nutrisnap-surface border border-border p-5 mb-6">
        <p className="text-xs text-muted-foreground mb-2">
          URL do Webhook (cole na sua plataforma de pagamento - Lowify, etc.):
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 text-foreground border border-border break-all">
            {webhookUrl}
          </code>
          <button onClick={copyUrl} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {copied ? (
              <CheckCircle className="h-4 w-4 text-nutrisnap-green" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Aceita qualquer payload JSON ou form-urlencoded da Lowify, Hotmart, Kiwify, etc. O nome do produto deve conter
          "PRO" ou "PREMIUM" para mapear o plano correto.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-nutrisnap-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <>
                <TableRow key={log.id}>
                  <TableCell>
                    <button onClick={() => toggleExpand(log.id)} className="text-muted-foreground hover:text-foreground">
                      {expanded[log.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">{log.customer_email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {log.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        log.status === "processed"
                          ? "bg-nutrisnap-green/20 text-nutrisnap-green"
                          : log.status?.startsWith("ignored") || log.status?.startsWith("error")
                          ? "bg-red-500/20 text-red-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        if (confirm("Excluir este evento?")) deleteOne(log.id);
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
                {expanded[log.id] && (
                  <TableRow key={log.id + "-payload"}>
                    <TableCell colSpan={6} className="bg-background/50">
                      <pre className="text-[11px] overflow-x-auto p-3 rounded-md bg-background border border-border max-h-72 overflow-y-auto">
                        {JSON.stringify(log.raw_payload, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  Nenhum webhook recebido ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
