import { useMemo } from "react";
import {
  AlertCircle,
  ArrowDown,
  CheckCheck,
  Hash,
  LoaderCircle,
  MoreHorizontal,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { useMessagesQuery } from "@/entities/client/api/queries";
import type { Message } from "@/entities/client/model/types";
import { getClientName, getInitials, formatDay, formatMessageTime } from "@/shared/lib/format";
import { useClientsQuery } from "@/entities/client/api/queries";
import { useInboxStore } from "@/features/inbox/model/inbox-store";

export function ConversationPanel() {
  const selectedClientId = useInboxStore((state) => state.selectedClientId);
  const clientsQuery = useClientsQuery();
  const messagesQuery = useMessagesQuery();
  const selectedClient = clientsQuery.data?.find((client) => client.id === selectedClientId);

  const messages = useMemo(
    () =>
      (messagesQuery.data ?? [])
        .filter(
          (message) =>
            selectedClientId !== null &&
            message.client_id !== null &&
            Number(message.client_id) === selectedClientId,
        )
        .sort((a, b) => getDate(a) - getDate(b)),
    [messagesQuery.data, selectedClientId],
  );

  if (!selectedClient) {
    return (
      <section className="conversation-card blank-conversation">
        <div className="blank-icon"><MessageIcon /></div>
        <h2>Select a conversation</h2>
        <p>Choose a client from the inbox to see the full message history.</p>
      </section>
    );
  }

  return (
    <section className="conversation-card">
      <header className="conversation-header">
        <div className={`client-avatar large avatar-${selectedClient.id % 5}`} aria-hidden="true">
          {getInitials(selectedClient)}
        </div>
        <div className="conversation-header-copy">
          <h2>{getClientName(selectedClient)}</h2>
          <p><span className="status-dot" /> Active on Telegram <span className="header-separator">·</span> #{selectedClient.user_telegram_id ?? selectedClient.id}</p>
        </div>
        <div className="conversation-actions">
          <button className="icon-button subtle" type="button" aria-label="Call client"><Phone size={17} /></button>
          <button className="icon-button subtle" type="button" aria-label="Start video call"><Video size={17} /></button>
          <button className="icon-button subtle" type="button" aria-label="More conversation actions"><MoreHorizontal size={19} /></button>
        </div>
      </header>

      <div className="message-scroll-area">
        {messagesQuery.isPending ? <MessageLoader /> : null}
        {messagesQuery.isError ? <MessagesError onRetry={() => messagesQuery.refetch()} /> : null}
        {messagesQuery.isSuccess && messages.length === 0 ? <EmptyMessages /> : null}
        {messagesQuery.isSuccess && messages.length > 0 ? <MessageTimeline messages={messages} /> : null}
      </div>

      <div className="composer-wrap">
        <div className="composer">
          <button className="composer-tool" type="button" aria-label="Add attachment"><Hash size={19} /></button>
          <input aria-label="Message" placeholder="Reply to this conversation…" disabled />
          <button className="composer-tool" type="button" aria-label="Add emoji"><Smile size={19} /></button>
          <button className="send-button" type="button" aria-label="Send message" disabled><Send size={17} fill="currentColor" /></button>
        </div>
        <p className="composer-note">Replies are read-only for now <span>·</span> synced from Telegram</p>
      </div>
    </section>
  );
}

function MessageTimeline({ messages }: { messages: Message[] }) {
  let lastDay = "";

  return (
    <div className="message-timeline">
      {messages.map((message) => {
        const day = formatDay(message.created_at);
        const showDay = day !== lastDay;
        lastDay = day;
        const isOutgoing = isLikelyOutgoing(message);

        return (
          <div className="message-group" key={message.id}>
            {showDay ? <div className="day-divider"><span>{day}</span></div> : null}
            <article className={`message-row ${isOutgoing ? "outgoing" : "incoming"}`}>
              {!isOutgoing ? <div className="message-mini-avatar">{message.author?.slice(0, 1).toUpperCase() ?? "C"}</div> : null}
              <div className="message-content">
                <div className="message-meta">
                  <strong>{isOutgoing ? "You" : message.author || "Client"}</strong>
                  <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
                </div>
                <div className="message-bubble">
                  {message.body || <span className="muted-message">Attachment</span>}
                </div>
                {isOutgoing ? <span className="message-status"><CheckCheck size={13} /> Delivered</span> : null}
              </div>
            </article>
          </div>
        );
      })}
      <div className="timeline-end"><span>End of conversation</span></div>
    </div>
  );
}

function isLikelyOutgoing(message: Message): boolean {
  const author = message.author?.toLowerCase() ?? "";
  return ["manager", "operator", "support", "admin", "bot", "you"].some((word) => author.includes(word));
}

function getDate(message: Message): number {
  return new Date(message.created_at).getTime() || message.id;
}

function MessageLoader() {
  return (
    <div className="message-loader">
      <LoaderCircle className="spin" size={22} />
      <span>Loading conversation…</span>
    </div>
  );
}

function MessagesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="message-state">
      <AlertCircle size={21} />
      <h3>Messages couldn’t be loaded</h3>
      <p>The client is selected, but the Messages edge function did not respond.</p>
      <button type="button" onClick={onRetry}>Try again</button>
    </div>
  );
}

function EmptyMessages() {
  return (
    <div className="message-state">
      <div className="empty-chat-icon"><ArrowDown size={19} /></div>
      <h3>No messages yet</h3>
      <p>There is no message history for this client.</p>
    </div>
  );
}

function MessageIcon() {
  return <Send size={22} />;
}
