import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { AdminFloatingButton } from "@/components/AdminFloatingButton";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
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
            to="/"
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
      { title: "NutriSnap AI — Análise Nutricional por Foto" },
      { name: "description", content: "Tire uma foto do prato e descubra calorias, macros e sugestões nutricionais com IA em segundos." },
      { property: "og:title", content: "NutriSnap AI — Análise Nutricional por Foto" },
      { property: "og:description", content: "Tire uma foto do prato e descubra calorias, macros e sugestões nutricionais com IA em segundos." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "NutriSnap AI — Análise Nutricional por Foto" },
      { name: "twitter:description", content: "Tire uma foto do prato e descubra calorias, macros e sugestões nutricionais com IA em segundos." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ca574466-09c2-48f6-8e68-896c971b790e/id-preview-86d2e841--3a670555-330a-4a31-b854-a08866d32c63.lovable.app-1775957454629.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ca574466-09c2-48f6-8e68-896c971b790e/id-preview-86d2e841--3a670555-330a-4a31-b854-a08866d32c63.lovable.app-1775957454629.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
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
  const hideNav = isAdmin || isApi || ["/login", "/sales", "/pricing"].includes(location.pathname);

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
      <AuthProvider>
        <AppLayout />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
