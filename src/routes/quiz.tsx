import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, ChevronRight, ChevronLeft, Camera, Sparkles, Check,
  Target, User, Cake, Weight, Ruler, Activity, AlertTriangle,
  Utensils, Trophy, Loader2, Zap, TrendingDown, Crown, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/quiz")({
  component: QuizPage,
});

type Answers = {
  goal?: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  targetWeight?: number;
  activity?: string;
  obstacle?: string;
  diet?: string;
  photoResult?: any;
};

type StepDef = {
  id: keyof Answers | "photo" | "intro" | "loading" | "results";
  kind: "choice" | "number" | "photo" | "intro" | "loading" | "results";
  icon?: any;
  title: string;
  subtitle?: string;
  options?: { value: string; label: string; emoji: string }[];
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
};

const STEPS: StepDef[] = [
  { id: "intro", kind: "intro", title: "Descubra seu plano nutricional ideal", subtitle: "Responda 8 perguntas rápidas e ganhe uma análise gratuita da sua próxima refeição 🎁" },
  {
    id: "goal", kind: "choice", icon: Target,
    title: "Qual é o seu principal objetivo?",
    options: [
      { value: "lose", label: "Perder peso", emoji: "🔥" },
      { value: "maintain", label: "Manter peso", emoji: "⚖️" },
      { value: "gain", label: "Ganhar massa", emoji: "💪" },
      { value: "health", label: "Comer melhor", emoji: "🥗" },
    ],
  },
  {
    id: "gender", kind: "choice", icon: User,
    title: "Qual seu gênero?",
    options: [
      { value: "female", label: "Feminino", emoji: "👩" },
      { value: "male", label: "Masculino", emoji: "👨" },
      { value: "other", label: "Outro", emoji: "🌈" },
    ],
  },
  { id: "age", kind: "number", icon: Cake, title: "Quantos anos você tem?", unit: "anos", min: 12, max: 100, placeholder: "Ex: 28" },
  { id: "weight", kind: "number", icon: Weight, title: "Qual seu peso atual?", unit: "kg", min: 30, max: 250, placeholder: "Ex: 70" },
  { id: "height", kind: "number", icon: Ruler, title: "Qual sua altura?", unit: "cm", min: 120, max: 220, placeholder: "Ex: 170" },
  { id: "targetWeight", kind: "number", icon: TrendingDown, title: "Qual seu peso desejado?", unit: "kg", min: 30, max: 250, placeholder: "Ex: 65" },
  {
    id: "activity", kind: "choice", icon: Activity,
    title: "Qual seu nível de atividade?",
    options: [
      { value: "sedentary", label: "Sedentário", emoji: "🛋️" },
      { value: "light", label: "Leve (1-2x/semana)", emoji: "🚶" },
      { value: "moderate", label: "Moderado (3-5x)", emoji: "🏃" },
      { value: "intense", label: "Intenso (6-7x)", emoji: "🏋️" },
    ],
  },
  {
    id: "obstacle", kind: "choice", icon: AlertTriangle,
    title: "O que mais te atrapalha hoje?",
    options: [
      { value: "time", label: "Falta de tempo", emoji: "⏰" },
      { value: "count", label: "Não sei contar calorias", emoji: "🤔" },
      { value: "cravings", label: "Vontades e beliscos", emoji: "🍫" },
      { value: "routine", label: "Falta de rotina", emoji: "📅" },
    ],
  },
  { id: "photo", kind: "photo", title: "🎁 Bônus liberado!", subtitle: "Envie a foto da sua próxima refeição e a IA analisa gratuitamente" },
  {
    id: "diet", kind: "choice", icon: Utensils,
    title: "Como é sua alimentação?",
    options: [
      { value: "onnivore", label: "Como de tudo", emoji: "🍖" },
      { value: "veg", label: "Vegetariana", emoji: "🥦" },
      { value: "low", label: "Low carb", emoji: "🥑" },
      { value: "processed", label: "Muito industrializado", emoji: "🍔" },
    ],
  },
  { id: "loading", kind: "loading", title: "Analisando suas respostas...", subtitle: "Nossa IA está montando seu plano" },
  { id: "results", kind: "results", title: "Seu plano está pronto! 🎉" },
];

function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [numberValue, setNumberValue] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  // Trigger loading calculation
  useEffect(() => {
    if (current.kind === "loading") {
      const t = setTimeout(() => setStep((s) => s + 1), 2200);
      return () => clearTimeout(t);
    }
  }, [step, current.kind]);

  const calc = useMemo(() => {
    const { weight = 70, height = 170, age = 30, gender = "female", activity = "light", targetWeight = 65, goal = "lose", obstacle, diet } = answers;
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    const mult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, intense: 1.725 };
    const tdee = Math.round(bmr * (mult[activity] || 1.375));
    let target = tdee;
    if (goal === "lose") target = tdee - 500;
    if (goal === "gain") target = tdee + 400;
    const diff = weight - targetWeight;
    const weeks = Math.max(1, Math.round((Math.abs(diff) / 0.5)));
    const bmi = weight / Math.pow(height / 100, 2);
    const bmiLabel =
      bmi < 18.5 ? "Abaixo do peso" :
      bmi < 25 ? "Peso saudável" :
      bmi < 30 ? "Sobrepeso" : "Obesidade";
    const water = Math.round(weight * 35); // ml/dia
    const steps = activity === "sedentary" ? 6000 : activity === "light" ? 8000 : 10000;
    const meals = goal === "gain" ? 5 : 4;

    // Personalized recommendations
    const recs: string[] = [];
    if (goal === "lose") recs.push(`Déficit de ~500 kcal/dia para perder ~0,5 kg/semana de forma saudável.`);
    if (goal === "gain") recs.push(`Superávit de ~400 kcal com foco em proteínas para ganho de massa magra.`);
    if (goal === "maintain") recs.push(`Manutenção calórica com foco em qualidade dos alimentos.`);
    if (obstacle === "time") recs.push(`Escaneie o prato em 3s com a IA — sem precisar pesar ou anotar.`);
    if (obstacle === "count") recs.push(`Deixe a IA contar calorias e macros de cada refeição por você.`);
    if (obstacle === "cravings") recs.push(`Distribua a proteína em 4 refeições para reduzir vontade de doces.`);
    if (obstacle === "routine") recs.push(`Notificações inteligentes para lembrar de registrar as refeições.`);
    if (diet === "processed") recs.push(`Reduza ultraprocessados: troque 1 refeição/dia por comida caseira.`);
    if (diet === "low") recs.push(`Mantenha carbo abaixo de ${Math.round(target * 0.2 / 4)}g/dia — sugerido para Low Carb.`);
    if (bmi >= 25 && goal !== "lose") recs.push(`Seu IMC está em ${bmiLabel.toLowerCase()} — considere ajustar a meta.`);

    return {
      bmr: Math.round(bmr),
      tdee,
      target: Math.max(1200, target),
      weeks,
      diff,
      bmi: bmi.toFixed(1),
      bmiLabel,
      protein: Math.round(weight * 1.8),
      carbs: Math.round((target * 0.45) / 4),
      fat: Math.round((target * 0.25) / 9),
      water,
      steps,
      meals,
      recs,
    };
  }, [answers]);

  const pick = (val: string) => {
    setAnswers({ ...answers, [current.id as string]: val });
    setTimeout(() => setStep((s) => s + 1), 200);
  };

  const submitNumber = () => {
    const n = parseFloat(numberValue);
    if (isNaN(n) || (current.min && n < current.min) || (current.max && n > current.max)) {
      toast.error(`Digite um valor entre ${current.min} e ${current.max}`);
      return;
    }
    setAnswers({ ...answers, [current.id as string]: n });
    setNumberValue("");
    setStep((s) => s + 1);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      setPhotoBase64(b64);
      setAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke("analyze-food", {
          body: { imageBase64: b64 },
        });
        if (error) throw error;
        setAnswers((a) => ({ ...a, photoResult: data }));
        toast.success("Análise concluída! 🎉");
      } catch (err) {
        toast.error("Não foi possível analisar. Continue mesmo assim.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-orange">
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold font-display">CaloriaX AI</span>
            </Link>
            <span className="text-xs text-muted-foreground">{step + 1}/{STEPS.length}</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-orange"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* INTRO */}
            {current.kind === "intro" && (
              <div className="text-center space-y-6 pt-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="mx-auto h-24 w-24 rounded-3xl gradient-orange flex items-center justify-center"
                >
                  <Trophy className="h-12 w-12 text-primary-foreground" />
                </motion.div>
                <h1 className="text-2xl font-bold font-display">{current.title}</h1>
                <p className="text-sm text-muted-foreground">{current.subtitle}</p>
                <div className="space-y-2 text-left bg-nutrisnap-surface rounded-2xl p-4 border border-border">
                  {["8 perguntas rápidas", "Análise gratuita da sua foto", "Plano personalizado por IA"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-nutrisnap-green" /> {t}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="w-full h-12 rounded-xl gradient-orange text-primary-foreground border-0"
                >
                  Começar quiz <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <p className="text-xs text-muted-foreground">Leva menos de 2 minutos</p>
              </div>
            )}

            {/* CHOICE */}
            {current.kind === "choice" && current.options && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  {current.icon && (
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <current.icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold font-display">{current.title}</h2>
                </div>
                <div className="space-y-3">
                  {current.options.map((opt) => {
                    const selected = (answers as any)[current.id] === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => pick(opt.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-nutrisnap-surface hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="flex-1 text-sm font-medium">{opt.label}</span>
                        {selected && <Check className="h-5 w-5 text-primary" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NUMBER */}
            {current.kind === "number" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {current.icon && (
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <current.icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold font-display">{current.title}</h2>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={numberValue}
                    onChange={(e) => setNumberValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitNumber()}
                    placeholder={current.placeholder}
                    className="h-16 text-2xl text-center pr-16 rounded-2xl"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    {current.unit}
                  </span>
                </div>
                <Button
                  onClick={submitNumber}
                  disabled={!numberValue}
                  className="w-full h-12 rounded-xl gradient-orange text-primary-foreground border-0"
                >
                  Continuar <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* PHOTO */}
            {current.kind === "photo" && (
              <div className="space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring" }}
                  className="mx-auto h-20 w-20 rounded-3xl gradient-orange flex items-center justify-center"
                >
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold font-display">{current.title}</h2>
                <p className="text-sm text-muted-foreground">{current.subtitle}</p>

                {photoBase64 && (
                  <div className="rounded-2xl overflow-hidden border border-border">
                    <img src={photoBase64} alt="Sua refeição" className="w-full h-48 object-cover" />
                  </div>
                )}

                {analyzing && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analisando com IA...
                  </div>
                )}

                {answers.photoResult && !analyzing && (
                  <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-primary/30 text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Análise da sua refeição</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-primary">
                          {answers.photoResult.foods?.reduce((a: number, f: any) => a + f.calories, 0) || 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">kcal</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {answers.photoResult.foods?.reduce((a: number, f: any) => a + f.protein, 0) || 0}g
                        </p>
                        <p className="text-[10px] text-muted-foreground">prot</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {answers.photoResult.foods?.reduce((a: number, f: any) => a + f.carbs, 0) || 0}g
                        </p>
                        <p className="text-[10px] text-muted-foreground">carb</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {answers.photoResult.foods?.reduce((a: number, f: any) => a + f.fat, 0) || 0}g
                        </p>
                        <p className="text-[10px] text-muted-foreground">gord</p>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />

                {!answers.photoResult ? (
                  <Button
                    onClick={() => fileRef.current?.click()}
                    disabled={analyzing}
                    className="w-full h-12 rounded-xl gradient-orange text-primary-foreground border-0"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {photoBase64 ? "Trocar foto" : "Enviar foto do prato"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    className="w-full h-12 rounded-xl gradient-orange text-primary-foreground border-0"
                  >
                    Continuar <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}

                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="text-xs text-muted-foreground underline"
                >
                  Pular por agora
                </button>
              </div>
            )}

            {/* LOADING */}
            {current.kind === "loading" && (
              <div className="text-center space-y-6 pt-16">
                <div className="mx-auto h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <h2 className="text-xl font-bold font-display">{current.title}</h2>
                <p className="text-sm text-muted-foreground">{current.subtitle}</p>
                <div className="space-y-2 max-w-xs mx-auto">
                  {["Calculando metabolismo basal", "Ajustando por atividade", "Definindo macros ideais"].map((t, i) => (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                      className="flex items-center gap-2 text-sm text-left"
                    >
                      <Check className="h-4 w-4 text-nutrisnap-green" /> {t}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* RESULTS */}
            {current.kind === "results" && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="mx-auto h-16 w-16 rounded-full gradient-orange flex items-center justify-center"
                  >
                    <Trophy className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                  <h2 className="text-2xl font-bold font-display">{current.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Baseado em suas respostas, criamos um plano personalizado
                  </p>
                </div>

                {/* Big number */}
                <div className="rounded-3xl gradient-orange p-6 text-center text-primary-foreground">
                  <p className="text-xs opacity-90 uppercase tracking-wide">Sua meta diária</p>
                  <p className="text-5xl font-bold font-display my-2">{calc.target}</p>
                  <p className="text-sm opacity-90">calorias/dia</p>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-nutrisnap-surface p-3 border border-border text-center">
                    <p className="text-lg font-bold text-nutrisnap-red">{calc.protein}g</p>
                    <p className="text-[10px] text-muted-foreground">Proteína</p>
                  </div>
                  <div className="rounded-2xl bg-nutrisnap-surface p-3 border border-border text-center">
                    <p className="text-lg font-bold text-nutrisnap-green">{calc.carbs}g</p>
                    <p className="text-[10px] text-muted-foreground">Carbo</p>
                  </div>
                  <div className="rounded-2xl bg-nutrisnap-surface p-3 border border-border text-center">
                    <p className="text-lg font-bold text-nutrisnap-blue">{calc.fat}g</p>
                    <p className="text-[10px] text-muted-foreground">Gordura</p>
                  </div>
                </div>

                {/* Insights */}
                <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Metabolismo basal (BMR)</span>
                    <span className="font-semibold">{calc.bmr} kcal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gasto diário total</span>
                    <span className="font-semibold">{calc.tdee} kcal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">IMC atual</span>
                    <span className="font-semibold">{calc.bmi} · {calc.bmiLabel}</span>
                  </div>
                  {calc.diff !== 0 && (
                    <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                      <span className="text-muted-foreground">Previsão para meta</span>
                      <span className="font-semibold text-primary">~{calc.weeks} semanas</span>
                    </div>
                  )}
                </div>

                {/* Suggested habits / goals */}
                <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Metas diárias sugeridas</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-base font-bold text-nutrisnap-blue">{(calc.water / 1000).toFixed(1)}L</p>
                      <p className="text-[10px] text-muted-foreground">Água/dia</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-nutrisnap-green">{calc.steps.toLocaleString("pt-BR")}</p>
                      <p className="text-[10px] text-muted-foreground">Passos/dia</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-primary">{calc.meals}</p>
                      <p className="text-[10px] text-muted-foreground">Refeições/dia</p>
                    </div>
                  </div>
                </div>

                {/* Personalized recommendations */}
                {calc.recs.length > 0 && (
                  <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Recomendações personalizadas</span>
                    </div>
                    {calc.recs.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-foreground/85">
                        <Check className="h-3.5 w-3.5 text-nutrisnap-green shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Macros breakdown table */}
                <div className="rounded-2xl bg-nutrisnap-surface p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Resumo dos macros calculados</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Proteína (1.8g/kg)</span><span className="font-semibold">{calc.protein}g · {calc.protein * 4} kcal</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Carboidratos (45%)</span><span className="font-semibold">{calc.carbs}g · {calc.carbs * 4} kcal</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Gorduras (25%)</span><span className="font-semibold">{calc.fat}g · {calc.fat * 9} kcal</span></div>
                  </div>
                </div>

                {/* Photo recap */}
                {answers.photoResult && (
                  <div className="rounded-2xl bg-primary/10 p-4 border border-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Sua análise gratuita foi salva</span>
                    </div>
                    <p className="text-xs text-foreground/80">
                      Crie sua conta para ver o histórico completo e continuar analisando refeições.
                    </p>
                  </div>
                )}

                {/* Sales pitch */}
                <div className="rounded-3xl border-2 border-primary/40 bg-nutrisnap-surface p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <span className="font-bold font-display">Desbloqueie seu plano completo</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Análises ilimitadas por foto",
                      "Acompanhamento diário automático",
                      "Receitas com IA baseadas no seu perfil",
                      "Suporte prioritário e novos recursos",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-nutrisnap-green shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">4.9 · +2.500 usuários</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 pb-10">
                  <Button
                    onClick={() => navigate({ to: "/pricing" })}
                    className="w-full h-14 rounded-xl gradient-orange text-primary-foreground border-0 text-base font-semibold"
                  >
                    Ver planos e desbloquear <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                  <Button
                    onClick={() => navigate({ to: "/login" })}
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                  >
                    Já tenho conta — entrar
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    ⚡ Oferta especial para novos usuários por tempo limitado
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && current.kind !== "loading" && current.kind !== "results" && (
          <button
            onClick={back}
            className="mt-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3 w-3" /> Voltar
          </button>
        )}
      </div>
    </div>
  );
}
