import { AlertCircle, LoaderCircle, MessageSquareDashed } from "lucide-react";
import { useClientsQuery } from "@/entities/client/api/queries";
import { getClientName, getInitials, formatRelativeTime } from "@/shared/lib/format";
import { useInboxStore } from "@/features/inbox/model/inbox-store";

export function ClientList() {
  const clientsQuery = useClientsQuery();
  const searchTerm = useInboxStore((state) => state.searchTerm);
  const selectedClientId = useInboxStore((state) => state.selectedClientId);
  const setSelectedClientId = useInboxStore((state) => state.setSelectedClientId);
  const clients = clientsQuery.data ?? [];

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    if (!normalizedSearch) return true;
    return `${getClientName(client)} ${client.user_telegram_id ?? ""}`
      .toLowerCase()
      .includes(normalizedSearch);
  });

  if (clientsQuery.isPending) {
    return (
      <div className="conversation-list" aria-label="Loading conversations">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="client-skeleton" key={index}>
            <span className="skeleton skeleton-avatar" />
            <span className="skeleton-lines">
              <span className="skeleton skeleton-name" />
              <span className="skeleton skeleton-preview" />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (clientsQuery.isError) {
    return (
      <div className="list-state error-state">
        <AlertCircle size={19} />
        <strong>Couldn’t load clients</strong>
        <span>Check the edge-function URL and try again.</span>
        <button type="button" onClick={() => clientsQuery.refetch()}>
          Retry connection
        </button>
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <div className="list-state empty-state">
        <MessageSquareDashed size={21} />
        <strong>{clients.length === 0 ? "No conversations yet" : "No matches found"}</strong>
        <span>{clients.length === 0 ? "New client messages will appear here." : "Try another name or Telegram ID."}</span>
      </div>
    );
  }

  return (
    <div className="conversation-list" aria-label="Client conversations">
      {filteredClients.map((client) => {
        const isSelected = client.id === selectedClientId;
        const name = getClientName(client);

        return (
          <button
            className={`client-row ${isSelected ? "selected" : ""}`}
            key={client.id}
            type="button"
            onClick={() => setSelectedClientId(client.id)}
            aria-current={isSelected ? "page" : undefined}
          >
            <span className={`client-avatar avatar-${client.id % 5}`} aria-hidden="true">
              {getInitials(client)}
            </span>
            <span className="client-row-copy">
              <span className="client-row-heading">
                <strong>{name}</strong>
                <time dateTime={client.last_message_at}>{formatRelativeTime(client.last_message_at)}</time>
              </span>
              <span className="client-row-preview">
                {client.user_telegram_id ? `Telegram · ${client.user_telegram_id}` : "Telegram conversation"}
              </span>
            </span>
            {clientsQuery.isFetching && isSelected ? <LoaderCircle className="spin" size={14} /> : null}
          </button>
        );
      })}
    </div>
  );
}
