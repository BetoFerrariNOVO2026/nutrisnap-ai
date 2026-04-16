import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MessageCircle, Mail, FileText, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  const faqs = [
    {
      q: "Como funciona a análise por foto?",
      a: "Basta tirar uma foto do seu prato ou fazer upload de uma imagem. Nossa IA identifica os alimentos e calcula automaticamente as calorias, proteínas, carboidratos e gorduras.",
    },
    {
      q: "Quantas análises posso fazer por dia?",
      a: "No plano gratuito você tem 3 análises por dia. No plano PRO, as análises são ilimitadas.",
    },
    {
      q: "A análise é precisa?",
      a: "Nossa IA tem uma precisão média de 85-90%. Para melhores resultados, tire fotos bem iluminadas e com os alimentos visíveis.",
    },
    {
      q: "Como faço upgrade para o plano PRO?",
      a: "Vá em Configurações > Plano e escolha o plano PRO. O pagamento é processado de forma segura.",
    },
    {
      q: "Posso cancelar minha assinatura?",
      a: "Sim! Você pode cancelar a qualquer momento em Configurações > Plano. O acesso PRO continua até o fim do período pago.",
    },
    {
      q: "Meus dados estão seguros?",
      a: "Sim. Todos os dados são criptografados e armazenados com segurança. Não compartilhamos suas informações com terceiros.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/settings">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground font-display">Ajuda</h1>
      </header>

      <div className="px-5 space-y-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-nutrisnap-surface border border-border p-4 flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">Chat de Suporte</span>
            <span className="text-[10px] text-muted-foreground">Em breve</span>
          </div>
          <a href="mailto:suporte@caloriaxai.com" className="rounded-2xl bg-nutrisnap-surface border border-border p-4 flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">E-mail</span>
            <span className="text-[10px] text-muted-foreground">suporte@caloriaxai.com</span>
          </a>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Perguntas frequentes</h2>
          <div className="rounded-xl bg-nutrisnap-surface border border-border overflow-hidden divide-y divide-border">
            {faqs.map((faq, i) => (
              <Collapsible key={i} open={openIndex === i} onOpenChange={(open) => setOpenIndex(open ? i : null)}>
                <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 text-sm text-foreground">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pl-11">
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl bg-nutrisnap-surface border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Termos de uso</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Política de privacidade</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">CaloriaX AI v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
