import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "pt" | "en" | "es";

type Dict = Record<string, { pt: string; en: string; es: string }>;

const dict: Dict = {
  // Header / common
  back: { pt: "Voltar", en: "Back", es: "Volver" },
  login: { pt: "Entrar", en: "Sign in", es: "Entrar" },
  signup: { pt: "Criar conta grátis", en: "Create free account", es: "Crear cuenta gratis" },
  startFree: { pt: "Começar grátis", en: "Start free", es: "Comenzar gratis" },
  // Sales
  heroTitle1: { pt: "Descubra as calorias do seu prato com", en: "Discover your meal's calories with", es: "Descubre las calorías de tu plato con" },
  heroTitle2: { pt: "uma foto", en: "one photo", es: "una foto" },
  heroSub: { pt: "Análise nutricional instantânea por IA. Proteínas, carboidratos, gorduras e sugestões personalizadas.", en: "Instant AI nutritional analysis. Protein, carbs, fats and personalized tips.", es: "Análisis nutricional instantáneo por IA. Proteínas, carbohidratos, grasas y sugerencias personalizadas." },
  freeAnalyses: { pt: "3 análises gratuitas por dia • Sem cartão de crédito", en: "3 free analyses per day • No credit card", es: "3 análisis gratis por día • Sin tarjeta" },
  howItWorks: { pt: "Como funciona", en: "How it works", es: "Cómo funciona" },
  testimonials: { pt: "O que dizem nossos usuários", en: "What our users say", es: "Lo que dicen nuestros usuarios" },
  plans: { pt: "Planos", en: "Plans", es: "Planes" },
  plansSub: { pt: "Comece grátis, upgrade quando quiser", en: "Start free, upgrade anytime", es: "Empieza gratis, mejora cuando quieras" },
  viewAllPlans: { pt: "Ver todos os planos", en: "See all plans", es: "Ver todos los planes" },
  ctaTitle: { pt: "Pronto para transformar sua alimentação?", en: "Ready to transform your nutrition?", es: "¿Listo para transformar tu alimentación?" },
  ctaSub: { pt: "Junte-se a milhares de pessoas que já usam o CaloriaX AI", en: "Join thousands already using CaloriaX AI", es: "Únete a miles que ya usan CaloriaX AI" },
  // Features
  feat1Title: { pt: "Escaneie seu prato", en: "Scan your meal", es: "Escanea tu plato" },
  feat1Desc: { pt: "Tire uma foto e receba análise nutricional completa em segundos", en: "Take a photo and get full nutritional analysis in seconds", es: "Toma una foto y recibe análisis completo en segundos" },
  feat2Title: { pt: "IA ultrarrápida", en: "Ultra-fast AI", es: "IA ultrarrápida" },
  feat2Desc: { pt: "Resultado em menos de 3 segundos com IA avançada", en: "Result in under 3 seconds with advanced AI", es: "Resultado en menos de 3 segundos con IA avanzada" },
  feat3Title: { pt: "Acompanhe sua evolução", en: "Track your progress", es: "Sigue tu evolución" },
  feat3Desc: { pt: "Dashboard com histórico, gráficos e metas personalizadas", en: "Dashboard with history, charts and custom goals", es: "Panel con historial, gráficos y metas personalizadas" },
  feat4Title: { pt: "Dados seguros", en: "Secure data", es: "Datos seguros" },
  feat4Desc: { pt: "Seus dados são criptografados e protegidos", en: "Your data is encrypted and protected", es: "Tus datos están cifrados y protegidos" },
  // Pricing
  choosePlan: { pt: "Escolha seu plano", en: "Choose your plan", es: "Elige tu plan" },
  cancelAnytime: { pt: "Cancele a qualquer momento. Sem compromisso.", en: "Cancel anytime. No commitment.", es: "Cancela cuando quieras. Sin compromiso." },
  guarantee: { pt: "Garantia de 7 dias", en: "7-day guarantee", es: "Garantía de 7 días" },
  guaranteeDesc: { pt: "Se não gostar, devolvemos 100% do valor. Sem perguntas.", en: "If you don't like it, we refund 100%. No questions.", es: "Si no te gusta, devolvemos el 100%. Sin preguntas." },
  perMonth: { pt: "/mês", en: "/mo", es: "/mes" },
  payCard: { pt: "Pagar com cartão", en: "Pay with card", es: "Pagar con tarjeta" },
  payPix: { pt: "Pagar com PIX", en: "Pay with PIX", es: "Pagar con PIX" },
  mostPopular: { pt: "MAIS POPULAR", en: "MOST POPULAR", es: "MÁS POPULAR" },
  // Recipes
  recipes: { pt: "Receitas com IA", en: "AI Recipes", es: "Recetas con IA" },
  recipesSub: { pt: "Receitas personalizadas geradas pela IA", en: "Personalized AI-generated recipes", es: "Recetas personalizadas generadas por IA" },
  goalLose: { pt: "Emagrecimento", en: "Weight loss", es: "Adelgazar" },
  goalGain: { pt: "Ganho de peso", en: "Weight gain", es: "Ganar peso" },
  goalHealthy: { pt: "Saudável", en: "Healthy", es: "Saludable" },
  generateRecipes: { pt: "Gerar receitas", en: "Generate recipes", es: "Generar recetas" },
  generating: { pt: "Gerando receitas...", en: "Generating recipes...", es: "Generando recetas..." },
  ingredients: { pt: "Ingredientes", en: "Ingredients", es: "Ingredientes" },
  instructions: { pt: "Modo de preparo", en: "Instructions", es: "Instrucciones" },
  prepTime: { pt: "Preparo", en: "Prep time", es: "Preparación" },
  servings: { pt: "Porções", en: "Servings", es: "Porciones" },
  tips: { pt: "Dicas", en: "Tips", es: "Consejos" },
  preferencesPlaceholder: { pt: "Preferências (opcional): ex: vegetariano, sem lactose...", en: "Preferences (optional): e.g. vegetarian, lactose-free...", es: "Preferencias (opcional): ej: vegetariano, sin lactosa..." },
  recipesCardTitle: { pt: "Receitas com IA", en: "AI Recipes", es: "Recetas con IA" },
  recipesCardDesc: { pt: "Crie receitas personalizadas em segundos", en: "Create personalized recipes in seconds", es: "Crea recetas personalizadas en segundos" },
  // Plans
  planStartName: { pt: "Start", en: "Start", es: "Start" },
  planStartDesc: { pt: "Ideal para começar sua transformação", en: "Perfect to start your transformation", es: "Ideal para comenzar tu transformación" },
  planStartCta: { pt: "Assinar Start", en: "Subscribe Start", es: "Suscribirse a Start" },
  planStartF1: { pt: "5 scans por dia", en: "5 scans per day", es: "5 escaneos por día" },
  planStartF2: { pt: "Histórico de 30 dias", en: "30-day history", es: "Historial de 30 días" },
  planStartF3: { pt: "Análise nutricional com IA", en: "AI nutritional analysis", es: "Análisis nutricional con IA" },
  planStartF4: { pt: "Sugestões personalizadas", en: "Personalized suggestions", es: "Sugerencias personalizadas" },
  planStartF5: { pt: "Receitas com IA", en: "AI Recipes", es: "Recetas con IA" },
  planProName: { pt: "PRO", en: "PRO", es: "PRO" },
  planProDesc: { pt: "Para quem leva a sério", en: "For those who are serious", es: "Para quienes van en serio" },
  planProCta: { pt: "Assinar PRO", en: "Subscribe PRO", es: "Suscribirse a PRO" },
  planProF1: { pt: "Scans ilimitados", en: "Unlimited scans", es: "Escaneos ilimitados" },
  planProF2: { pt: "Histórico completo", en: "Full history", es: "Historial completo" },
  planProF3: { pt: "Análise avançada com IA", en: "Advanced AI analysis", es: "Análisis avanzado con IA" },
  planProF4: { pt: "Sugestões personalizadas", en: "Personalized suggestions", es: "Sugerencias personalizadas" },
  planProF5: { pt: "Dashboard completo", en: "Complete dashboard", es: "Panel completo" },
  planProF6: { pt: "Exportar relatórios", en: "Export reports", es: "Exportar informes" },
  planProF7: { pt: "Suporte prioritário", en: "Priority support", es: "Soporte prioritario" },
  planPremiumName: { pt: "Premium", en: "Premium", es: "Premium" },
  planPremiumDesc: { pt: "Para profissionais", en: "For professionals", es: "Para profesionales" },
  planPremiumCta: { pt: "Assinar Premium", en: "Subscribe Premium", es: "Suscribirse a Premium" },
  planPremiumF1: { pt: "Tudo do PRO", en: "Everything in PRO", es: "Todo lo del PRO" },
  planPremiumF2: { pt: "Plano alimentar personalizado", en: "Personalized meal plan", es: "Plan alimentario personalizado" },
  planPremiumF3: { pt: "Integração com smartwatch", en: "Smartwatch integration", es: "Integración con smartwatch" },
  planPremiumF4: { pt: "Consultas com nutricionista IA", en: "AI nutritionist consultations", es: "Consultas con nutricionista IA" },
  planPremiumF5: { pt: "API para integrações", en: "API for integrations", es: "API para integraciones" },
  planPremiumF6: { pt: "Multi-perfil (família)", en: "Multi-profile (family)", es: "Multi-perfil (familia)" },
  // Date filter
  filterToday: { pt: "Hoje", en: "Today", es: "Hoy" },
  filterYesterday: { pt: "Ontem", en: "Yesterday", es: "Ayer" },
  filterCustom: { pt: "Personalizado", en: "Custom", es: "Personalizado" },
  weekSun: { pt: "Dom", en: "Sun", es: "Dom" },
  weekMon: { pt: "Seg", en: "Mon", es: "Lun" },
  weekTue: { pt: "Ter", en: "Tue", es: "Mar" },
  weekWed: { pt: "Qua", en: "Wed", es: "Mié" },
  weekThu: { pt: "Qui", en: "Thu", es: "Jue" },
  weekFri: { pt: "Sex", en: "Fri", es: "Vie" },
  weekSat: { pt: "Sáb", en: "Sat", es: "Sáb" },
  recentMeals: { pt: "Refeições recentes", en: "Recent meals", es: "Comidas recientes" },
  loginToSee: { pt: "Faça login para ver seus dados", en: "Sign in to see your data", es: "Inicia sesión para ver tus datos" },
  noMealsDay: { pt: "Nenhuma refeição registrada neste dia", en: "No meals recorded on this day", es: "Sin comidas registradas este día" },
  pickDate: { pt: "Escolher data", en: "Pick a date", es: "Elegir fecha" },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLang(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = localStorage.getItem("app-lang") as Lang | null;
  if (stored && ["pt", "en", "es"].includes(stored)) return stored;
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("es")) return "es";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("app-lang", l); } catch {}
  };

  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? dict[key]?.pt ?? String(key);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback (allows usage before provider mounts during SSR)
    return { lang: "pt" as Lang, setLang: () => {}, t: (k: keyof typeof dict) => dict[k]?.pt ?? String(k) };
  }
  return ctx;
}
