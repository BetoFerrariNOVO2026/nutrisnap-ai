import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Crown, ArrowLeft, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function useIsInternational() {
  const [isIntl, setIsIntl] = useState(false);
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang = navigator.language;
      // If not Brazilian timezone/locale, show international pricing
      if (!tz.startsWith("America/Sao_Paulo") && !tz.startsWith("America/Fortaleza") && !tz.startsWith("America/Bahia") && !tz.startsWith("America/Recife") && !tz.startsWith("America/Belem") && !tz.startsWith("America/Manaus") && !tz.startsWith("America/Cuiaba") && !lang.startsWith("pt")) {
        setIsIntl(true);
      }
    } catch {}
  }, []);
  return isIntl;
}

function PricingPage() {
  const isIntl = useIsInternational();

  const plans = isIntl
    ? [
        {
          name: "Free",
          price: "$0",
          period: "/mo",
          description: "Perfect to try it out",
          features: [
            "3 scans per day",
            "7-day history",
            "Basic macro analysis",
            "Simple dashboard",
          ],
          ctaText: "Start free",
          highlight: false,
          cardLink: null,
          pixLink: null,
        },
        {
          name: "PRO",
          price: "$3.99",
          period: "/mo",
          description: "For those who are serious",
          features: [
            "Unlimited scans",
            "Full history",
            "Advanced AI analysis",
            "Personalized suggestions",
            "Complete dashboard",
            "Export reports",
            "Priority support",
          ],
          ctaText: "Subscribe PRO",
          highlight: true,
          badge: "MOST POPULAR",
          cardLink: "https://adsroi.com.br/checkout/9PmDwk",
          pixLink: null,
        },
        {
          name: "Premium",
          price: "$9.90",
          period: "/mo",
          description: "For professionals",
          features: [
            "Everything in PRO",
            "Personalized meal plan",
            "Smartwatch integration",
            "AI nutritionist consultations",
            "API for integrations",
            "Multi-profile (family)",
          ],
          ctaText: "Subscribe Premium",
          highlight: false,
          cardLink: "https://adsroi.com.br/checkout/9PmDwk?offer=offer-1776009383029",
          pixLink: null,
        },
      ]
    : [
        {
          name: "Gratuito",
          price: "R$0",
          period: "/mês",
          description: "Perfeito para experimentar",
          features: [
            "3 scans por dia",
            "Histórico de 7 dias",
            "Análise básica de macros",
            "Dashboard simplificado",
          ],
          ctaText: "Começar grátis",
          highlight: false,
          cardLink: null,
          pixLink: null,
        },
        {
          name: "PRO",
          price: "R$19,90",
          period: "/mês",
          description: "Para quem leva a sério",
          features: [
            "Scans ilimitados",
            "Histórico completo",
            "Análise avançada com IA",
            "Sugestões personalizadas",
            "Dashboard completo",
            "Exportar relatórios",
            "Suporte prioritário",
          ],
          ctaText: "Assinar PRO",
          highlight: true,
          badge: "MAIS POPULAR",
          cardLink: "https://adsroi.com.br/checkout/9PmDwk",
          pixLink: "https://pay.lowify.com.br/checkout?product_id=LjGA4s",
        },
        {
          name: "Premium",
          price: "R$39,90",
          period: "/mês",
          description: "Para profissionais",
          features: [
            "Tudo do PRO",
            "Plano alimentar personalizado",
            "Integração com smartwatch",
            "Consultas com nutricionista IA",
            "API para integrações",
            "Multi-perfil (família)",
          ],
          ctaText: "Assinar Premium",
          highlight: false,
          cardLink: "https://adsroi.com.br/checkout/9PmDwk?offer=offer-1776009383029",
          pixLink: "https://pay.lowify.com.br/go.php?offer=2sweh1d",
        },
      ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="px-5 pt-6 pb-4">
        <Link to="/sales" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {isIntl ? "Back" : "Voltar"}
        </Link>
      </header>

      <div className="px-5 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground font-display">
              {isIntl ? "Choose your plan" : "Escolha seu plano"}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            {isIntl ? "Cancel anytime. No commitment." : "Cancele a qualquer momento. Sem compromisso."}
          </p>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-5 border relative ${
                plan.highlight
                  ? "gradient-orange border-primary/30"
                  : "bg-nutrisnap-surface border-border"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-4 rounded-full bg-foreground px-3 py-0.5 text-[10px] font-bold text-background">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`text-base font-bold ${plan.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-0.5 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${plan.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-nutrisnap-green"}`} />
                    <span className={`text-xs ${plan.highlight ? "text-primary-foreground/90" : "text-foreground/80"}`}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {plan.cardLink ? (
                <div className="space-y-2">
                  <a href={plan.cardLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button
                      className={`w-full rounded-xl ${
                        plan.highlight
                          ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                          : ""
                      }`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.highlight && <Star className="h-4 w-4 mr-1" />}
                      💳 {plan.ctaText}
                    </Button>
                  </a>
                  {plan.pixLink && (
                    <a href={plan.pixLink} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full rounded-xl text-xs">
                        <span className="mr-1">📱</span> {isIntl ? "Pay with PIX" : "Pagar com PIX"}
                      </Button>
                    </a>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="w-full rounded-xl">
                    {plan.ctaText}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-nutrisnap-surface p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {isIntl ? "7-day guarantee" : "Garantia de 7 dias"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isIntl
              ? "If you don't like it, we'll refund 100% of the amount. No questions asked."
              : "Se não gostar, devolvemos 100% do valor. Sem perguntas."}
          </p>
        </div>
      </div>
    </div>
  );
}
