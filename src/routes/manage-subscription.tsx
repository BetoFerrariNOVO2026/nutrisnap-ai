import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, RefreshCw, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";

export const Route = createFileRoute("/manage-subscription")({
  component: ManageSubscriptionPage,
});

function ManageSubscriptionPage() {
  const { user } = useAuth();
  const { plan, isPaid, loading } = useSubscription();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const planLabel =
    plan === "premium" ? "Premium" : plan === "pro" ? "Pro" : plan === "start" ? "Start" : "Gratuito";

  const handleCancel = async () => {
    if (!user) return;
    setCancelling(true);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_plan: "free" })
      .eq("user_id", user.id);
    setCancelling(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assinatura cancelada. Você voltou ao plano gratuito.");
    navigate({ to: "/settings" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/settings" className="p-2 -ml-2 rounded-full hover:bg-secondary/50">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground font-display">Gerenciar assinatura</h1>
      </header>

      <div className="px-5 space-y-5">
        {/* Cartão do plano atual */}
        <div className="rounded-2xl gradient-orange p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-primary-foreground" />
            <span className="text-xs uppercase tracking-wider text-primary-foreground/80 font-semibold">
              Plano atual
            </span>
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground font-display">
            {loading ? "..." : planLabel}
          </h2>
          <p className="text-xs text-primary-foreground/80 mt-1">
            {isPaid
              ? "Você tem acesso completo aos recursos premium do CaloriaX."
              : "Você está no plano gratuito com recursos limitados."}
          </p>
        </div>

        {/* Ações */}
        <div className="rounded-2xl bg-nutrisnap-surface border border-border overflow-hidden divide-y divide-border">
          <button
            onClick={() => navigate({ to: "/pricing" })}
            className="flex w-full items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
          >
            <RefreshCw className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {isPaid ? "Mudar de plano" : "Fazer upgrade"}
              </p>
              <p className="text-xs text-muted-foreground">Ver planos e opções de pagamento</p>
            </div>
          </button>

          {isPaid && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-left">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Cancelar assinatura</p>
                    <p className="text-xs text-muted-foreground">
                      Voltar ao plano gratuito imediatamente
                    </p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar assinatura {planLabel}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você perderá o acesso aos recursos premium e voltará ao plano gratuito.
                    Essa ação pode ser revertida assinando novamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {cancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Confirmar cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center px-4">
          Precisa de ajuda com cobrança ou reembolso?{" "}
          <Link to="/help" className="text-primary font-medium hover:underline">
            Fale com o suporte
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
