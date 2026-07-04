import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { AdminFloatingButton } from "@/components/AdminFloatingButton";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider } from "@/lib/i18n";
import { useLocation } from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe.
        </p>
        <div className="mt-6">
          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CaloriaX AI — Análise Nutricional por Foto" },
      { name: "description", content: "Tire uma foto do prato e descubra calorias, macros e sugestões nutricionais com IA em segundos." },
      { property: "og:title", content: "CaloriaX AI — Análise Nutricional por Foto" },
      { property: "og:description", content: "Tire uma foto do prato e descubra calorias, macros e sugestões nutricionais com IA em segundos." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "CaloriaX AI — Análise Nutricional por Foto" },
      { name: "twitter:description", content: "Tire uma foto do prato e descubra calorias, macros e sugestões nutricionais com IA em segundos." },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:image", content: "/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#F97316" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "CaloriaX AI" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/app-icon-512.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/app-icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isApi = location.pathname.startsWith("/api");
  const hideNav = isAdmin || isApi || ["/login", "/", "/pricing", "/quiz", "/sales"].includes(location.pathname);

  if (isAdmin || isApi) {
    return <Outlet />;
  }

  return (
    <>
      <AdminFloatingButton />
      <div className="mx-auto max-w-lg">
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AppLayout />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
