import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Webhook, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/webhooks")({
  component: AdminWebhooksPage,
});

function AdminWebhooksPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/payment-webhook`
    : "";

  useEffect(() => {
    supabase
      .from("payment_webhooks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setLogs(data);
      });
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-bold text-foreground mb-6 font-display flex items-center gap-2">
        <Webhook className="h-5 w-5 text-primary" />
        Webhooks de Pagamento
      </h1>

      <div className="rounded-xl bg-nutrisnap-surface border border-border p-5 mb-6">
        <p className="text-xs text-muted-foreground mb-2">URL do Webhook (cole na plataforma de pagamento):</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 text-foreground border border-border break-all">
            {webhookUrl}
          </code>
          <button onClick={copyUrl} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {copied ? <CheckCircle className="h-4 w-4 text-nutrisnap-green" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Formato esperado (JSON POST):</strong></p>
          <pre className="bg-background rounded-lg p-3 border border-border overflow-x-auto text-[11px]">
{`{
  "event": "payment.approved",
  "customer_email": "user@email.com",
  "plan": "pro",        // "pro" ou "premium"
  "external_id": "TXN123"
}`}
          </pre>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-nutrisnap-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{log.customer_email || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{log.plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      log.status === "processed"
                        ? "bg-nutrisnap-green/20 text-nutrisnap-green"
                        : "bg-yellow-500/20 text-yellow-500"
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
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
