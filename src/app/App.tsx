import { QueryProvider } from "./providers/query-provider";
import { useCallback, useEffect, useState } from "react";
import { useAuthUser } from "@/features/auth/model/use-auth-user";
import { InboxPage } from "@/pages/inbox";
import { LoginPage } from "@/pages/login/ui/login-page";
import { AppHeader } from "@/widgets/header/ui/app-header";
import "@/shared/styles/global.css";

export function App() {
  const auth = useAuthUser();
  const [pathname, setPathname] = useState(getCurrentPathname);

  useEffect(() => {
    const handlePopState = () => setPathname(getCurrentPathname());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  }, []);

  useEffect(() => {
    if (auth.isLoading) return;

    const expectedPath = auth.user ? "/" : "/login";
    if (pathname !== expectedPath) {
      navigate(expectedPath);
    }
  }, [auth.isLoading, auth.user, navigate, pathname]);

  const isLoginPath = pathname === "/login";
  const isAuthenticated = Boolean(auth.user);

  return (
    <QueryProvider>
      {isLoginPath || (!auth.isLoading && !isAuthenticated) ? (
        <div className="app-canvas login-canvas">
          <LoginPage onSuccess={() => navigate("/")} />
        </div>
      ) : null}

      {!isLoginPath && auth.isLoading ? (
        <div className="app-canvas">
          <AppHeader user={auth.user} isLoading={auth.isLoading} />
        </div>
      ) : null}

      {!isLoginPath && !auth.isLoading && isAuthenticated ? (
        <div className="app-canvas">
          <AppHeader user={auth.user} isLoading={auth.isLoading} />
          <InboxPage user={auth.user} />
        </div>
      ) : null}
    </QueryProvider>
  );
}

function getCurrentPathname(): string {
  return window.location.pathname.replace(/\/$/, "") || "/";
}
