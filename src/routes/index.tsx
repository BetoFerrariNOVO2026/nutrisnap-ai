import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Flame, Camera, BarChart3, Zap, Shield, Star, ChevronRight, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import salesHero from "@/assets/sales-hero.jpg";

export const Route = createFileRoute("/")({
  component: SalesPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SalesPage() {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.remove("dark");
    html.classList.add("light");
    return () => {
      html.classList.remove("light");
      if (wasDark) html.classList.add("dark");
    };
  }, []);

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/home" });
    }
  }, [user, loading, navigate]);

  const features = [
    { icon: Camera, title: "Escaneie seu prato", desc: "Tire uma foto e receba análise nutricional completa em segundos" },
    { icon: Zap, title: "IA ultrarrápida", desc: "Resultado em menos de 3 segundos com inteligência artificial avançada" },
    { icon: BarChart3, title: "Acompanhe sua evolução", desc: "Dashboard completo com histórico, gráficos e metas personalizadas" },
    { icon: Shield, title: "Dados seguros", desc: "Seus dados são criptografados e protegidos com segurança máxima" },
  ];

  const testimonials = [
    { name: "Ana Paula", text: "Perdi 8kg em 3 meses usando o CaloriaX AI diariamente!", rating: 5 },
    { name: "Carlos M.", text: "Simples e rápido. Mudou minha relação com a comida.", rating: 5 },
    { name: "Juliana S.", text: "Melhor app de nutrição que já usei. A IA é incrível!", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative px-5 pt-8 pb-10 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-orange">
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-foreground font-display">CaloriaX AI</span>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full">
                Entrar
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-4 mb-8"
          >
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-foreground font-display leading-tight"
            >
              Descubra as calorias do seu prato com{" "}
              <span className="text-primary">uma foto</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-sm text-muted-foreground max-w-xs mx-auto"
            >
              Análise nutricional instantânea por IA. Proteínas, carboidratos, gorduras e sugestões personalizadas.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-2xl overflow-hidden mb-6 border border-border"
          >
            <img src={salesHero} alt="CaloriaX AI - Análise nutricional por foto" className="w-full h-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Link to="/login">
              <Button className="w-full h-12 rounded-xl text-sm font-semibold gradient-orange text-primary-foreground border-0">
                Começar grátis
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              3 análises gratuitas por dia • Sem cartão de crédito
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <AnimatedSection className="px-5 py-10 max-w-lg mx-auto">
        <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-lg font-bold text-foreground font-display text-center mb-6">
          Como funciona
        </motion.h2>
        <div className="grid grid-cols-1 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 rounded-2xl bg-nutrisnap-surface p-4 border border-border"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="px-5 py-10 max-w-lg mx-auto">
        <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-lg font-bold text-foreground font-display text-center mb-6">
          O que dizem nossos usuários
        </motion.h2>
        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-nutrisnap-surface p-4 border border-border"
            >
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-xs text-foreground/80 mb-2">"{t.text}"</p>
              <p className="text-xs font-semibold text-muted-foreground">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Pricing preview */}
      <AnimatedSection className="px-5 py-10 max-w-lg mx-auto">
        <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-lg font-bold text-foreground font-display text-center mb-2">
          Planos
        </motion.h2>
        <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-xs text-muted-foreground text-center mb-6">Comece grátis, upgrade quando quiser</motion.p>

        <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-2">Gratuito</h3>
            <p className="text-2xl font-bold text-foreground">R$0</p>
            <p className="text-xs text-muted-foreground mb-3">/mês</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <Check className="h-3 w-3 text-nutrisnap-green" /> 1 scan/dia
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <Check className="h-3 w-3 text-nutrisnap-green" /> Histórico básico
              </div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="rounded-2xl gradient-orange p-4 border border-primary/30 relative">
            <div className="absolute -top-2 right-3 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
              POPULAR
            </div>
            <h3 className="text-sm font-bold text-primary-foreground mb-2">PRO</h3>
            <p className="text-2xl font-bold text-primary-foreground">R$19,90</p>
            <p className="text-xs text-primary-foreground/80 mb-3">/mês</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-primary-foreground/90">
                <Check className="h-3 w-3" /> Ilimitado
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-foreground/90">
                <Check className="h-3 w-3" /> IA avançada
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Link to="/pricing" className="block mt-4">
            <Button variant="outline" className="w-full rounded-xl">
              Ver todos os planos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="px-5 py-10 max-w-lg mx-auto text-center">
        <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} className="text-lg font-bold text-foreground font-display mb-2">
          Pronto para transformar sua alimentação?
        </motion.h2>
        <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-xs text-muted-foreground mb-4">
          Junte-se a milhares de pessoas que já usam o CaloriaX AI
        </motion.p>
        <motion.div variants={scaleIn} transition={{ duration: 0.5 }}>
          <Link to="/login">
            <Button className="h-12 px-8 rounded-xl text-sm font-semibold gradient-orange text-primary-foreground border-0">
              Criar conta grátis
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </AnimatedSection>

      <footer className="px-5 py-6 max-w-lg mx-auto text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 CaloriaX AI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
