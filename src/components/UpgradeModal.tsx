import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Crown, Check, Zap, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border bg-background">
        <div className="gradient-orange p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur">
            <Crown className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-xl font-bold">
              Limite diário atingido
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/90 text-sm mt-1">
              Faça upgrade e tenha scans ilimitados agora mesmo
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-3">
          {/* PRO */}
          <Link
            to="/pricing"
            onClick={() => onOpenChange(false)}
            className="block rounded-2xl border-2 border-primary/30 bg-nutrisnap-surface p-4 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">PRO</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">R$ 10<span className="text-xs text-muted-foreground">/mês</span></div>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Scans ilimitados</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Histórico completo</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Análise nutricional avançada</li>
            </ul>
          </Link>

          {/* PREMIUM */}
          <Link
            to="/pricing"
            onClick={() => onOpenChange(false)}
            className="block rounded-2xl gradient-orange p-4 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 rounded-full bg-primary-foreground/20 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              MAIS POPULAR
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
                <span className="font-bold text-primary-foreground">PREMIUM</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-foreground">R$ 17<span className="text-xs text-primary-foreground/80">/mês</span></div>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-primary-foreground/90">
              <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Tudo do PRO</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Plano alimentar personalizado</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Suporte prioritário</li>
            </ul>
          </Link>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-xs text-muted-foreground py-2 hover:text-foreground"
          >
            Talvez mais tarde
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
