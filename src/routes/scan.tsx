import { createFileRoute } from "@tanstack/react-router";
import { Camera, Upload, ImageIcon, Zap } from "lucide-react";
import { useState, useRef } from "react";
import { NutritionResult } from "@/components/NutritionResult";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
});

function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      simulateAnalysis();
    };
    reader.readAsDataURL(file);
  };

  const simulateAnalysis = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        foods: [
          { name: "Arroz Branco", calories: 206, protein: 4, carbs: 45, fat: 0.4, portion: "150g" },
          { name: "Feijão Preto", calories: 132, protein: 9, carbs: 24, fat: 0.5, portion: "100g" },
          { name: "Frango Grelhado", calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "120g" },
          { name: "Salada", calories: 25, protein: 1.5, carbs: 4, fat: 0.3, portion: "80g" },
        ],
        healthScore: 7,
        suggestions: [
          "Troque arroz branco por integral para mais fibras",
          "Adicione azeite de oliva para gorduras saudáveis",
          "Ótima fonte de proteína com o frango grelhado!",
        ],
      });
      setAnalyzing(false);
    }, 2500);
  };

  const resetScan = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-foreground font-display">Scanner</h1>
        <p className="text-xs text-muted-foreground mt-1">Tire uma foto do seu prato</p>
      </header>

      <div className="px-5">
        {!image ? (
          <div className="space-y-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-primary/30 bg-nutrisnap-surface flex flex-col items-center justify-center gap-4 transition-colors hover:border-primary/60"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-orange scan-pulse">
                <Camera className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Toque para escanear</p>
                <p className="text-xs text-muted-foreground mt-1">ou arraste uma imagem</p>
              </div>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-nutrisnap-surface p-4 border border-border"
              >
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Upload</span>
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-nutrisnap-surface p-4 border border-border">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Galeria</span>
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 border border-primary/20">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-foreground/80">Resultado em menos de 3 segundos com IA</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">2/3 scans gratuitos restantes hoje</p>
              <button className="mt-1 text-xs font-semibold text-primary">Upgrade para PRO →</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={image} alt="Prato" className="w-full aspect-[4/3] object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm font-medium text-foreground">Analisando com IA...</p>
                </div>
              )}
            </div>

            {result && (
              <NutritionResult
                foods={result.foods}
                healthScore={result.healthScore}
                suggestions={result.suggestions}
                onDone={resetScan}
                onAdjust={() => {}}
              />
            )}

            {!analyzing && !result && (
              <button onClick={resetScan} className="w-full rounded-xl bg-secondary p-3 text-sm font-medium text-foreground">
                Tirar outra foto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
