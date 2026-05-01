import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone === true;
    if (standalone) setInstalled(true);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert(
        'Para instalar no iPhone:\n\n1. Toque no botão Compartilhar (ícone de seta para cima)\n2. Role e toque em "Adicionar à Tela de Início"'
      );
    } else {
      alert(
        "Para instalar este app:\n\n• No Chrome/Edge: toque no menu (⋮) e escolha \"Instalar app\" ou \"Adicionar à tela inicial\".\n• No Safari (iOS): toque em Compartilhar e \"Adicionar à Tela de Início\"."
      );
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={`rounded-full gap-1.5 ${className}`}
    >
      <Download className="h-3.5 w-3.5" />
      Baixar app
    </Button>
  );
}
