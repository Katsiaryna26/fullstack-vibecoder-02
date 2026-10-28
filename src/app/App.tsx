import { QueryProvider } from "./providers/query-provider";
import { useAuthUser } from "@/features/auth/model/use-auth-user";
import { InboxPage } from "@/pages/inbox";
import { AppHeader } from "@/widgets/header/ui/app-header";
import "@/shared/styles/global.css";

export function App() {
  const auth = useAuthUser();

  return (
    <QueryProvider>
      <div className="app-canvas">
        <AppHeader user={auth.user} isLoading={auth.isLoading} />
        <InboxPage user={auth.user} />
      </div>
    </QueryProvider>
  );
}
