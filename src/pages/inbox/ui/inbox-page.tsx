import { useEffect, useMemo } from "react";
import { Inbox, MessageCircle, Search, SlidersHorizontal, Wifi } from "lucide-react";
import { useClientsQuery } from "@/entities/client/api/queries";
import { getClientName } from "@/shared/lib/format";
import { useInboxStore } from "@/features/inbox/model/inbox-store";
import { ClientList } from "./client-list";
import { ConversationPanel } from "./conversation-panel";

export function InboxPage() {
  const clientsQuery = useClientsQuery();
  const clients = clientsQuery.data ?? [];
  const selectedClientId = useInboxStore((state) => state.selectedClientId);
  const setSelectedClientId = useInboxStore((state) => state.setSelectedClientId);

  useEffect(() => {
    if (clients.length === 0) return;

    const selectedStillExists = clients.some((client) => client.id === selectedClientId);
    if (!selectedStillExists) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId, setSelectedClientId]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId],
  );

  return (
    <div className="app-canvas">
      <div className="inbox-shell">
        <aside className="sidebar" aria-label="Client conversations">
          <div className="sidebar-topbar">
            <div className="brand-lockup">
              <div className="brand-mark" aria-hidden="true">
                <MessageCircle size={18} strokeWidth={2.6} />
              </div>
              <span>relay</span>
            </div>
            <button className="icon-button subtle" type="button" aria-label="Inbox settings">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <div className="workspace-heading">
            <div>
              <p className="eyebrow">Workspace</p>
              <h1>Inbox</h1>
            </div>
            <div className="live-indicator" title="Connected to edge functions">
              <Wifi size={14} />
              <span>Live</span>
            </div>
          </div>

          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search conversations</span>
            <input
              value={useInboxStore((state) => state.searchTerm)}
              onChange={(event) => useInboxStore.getState().setSearchTerm(event.target.value)}
              placeholder="Search conversations"
            />
            <kbd>⌘ K</kbd>
          </label>

          <div className="inbox-tabs" role="tablist" aria-label="Conversation filters">
            <button className="tab-button active" type="button" role="tab" aria-selected="true">
              <Inbox size={15} />
              All conversations
              <span>{clients.length}</span>
            </button>
          </div>

          <ClientList />

          <div className="sidebar-footer">
            <div className="profile-avatar">AL</div>
            <div className="profile-copy">
              <strong>Alex Laurent</strong>
              <span>Support workspace</span>
            </div>
            <span className="online-dot" aria-label="Online" />
          </div>
        </aside>

        <main className="conversation-area">
          <div className="conversation-context">
            <p>
              {selectedClient ? `Conversation with ${getClientName(selectedClient)}` : "Your conversations"}
            </p>
            <span>Client inbox</span>
          </div>
          <ConversationPanel />
        </main>
      </div>
    </div>
  );
}
