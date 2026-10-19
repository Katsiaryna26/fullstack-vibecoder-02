import { QueryProvider } from "./providers/query-provider";
import { InboxPage } from "@/pages/inbox";
import "@/shared/styles/global.css";

export function App() {
  return (
    <QueryProvider>
      <InboxPage />
    </QueryProvider>
  );
}
