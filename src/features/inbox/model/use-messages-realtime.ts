import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/entities/client/model/types";
import { supabase } from "@/shared/api/supabase";

export type RealtimeStatus = "connecting" | "connected" | "error" | "unavailable";

export function useMessagesRealtime(clientId: number | null): RealtimeStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("unavailable");

  useEffect(() => {
    if (!clientId || !supabase) {
      setStatus("unavailable");
      return;
    }

    setStatus("connecting");
    const realtimeClient = supabase;

    const channel = realtimeClient
      .channel(`messages-for-client-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const incomingMessage = payload.new as Message;

          if (Number(incomingMessage.client_id) !== clientId) return;

          let hadCachedMessages = false;
          queryClient.setQueryData<Message[]>(["messages", clientId], (messages) => {
            hadCachedMessages = messages !== undefined;

            if (!messages || messages.some((message) => message.id === incomingMessage.id)) {
              return messages;
            }

            return [...messages, incomingMessage];
          });

          // If the insert arrived before the history request completed, let the
          // existing query fetch reconcile the cache with the authoritative list.
          if (!hadCachedMessages) {
            void queryClient.invalidateQueries({ queryKey: ["messages", clientId] });
          }

          // Refresh the sidebar timestamp/order when a message arrives.
          void queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setStatus("connected");
        } else if (
          subscriptionStatus === "CHANNEL_ERROR" ||
          subscriptionStatus === "TIMED_OUT"
        ) {
          setStatus("error");
        } else if (subscriptionStatus === "CLOSED") {
          setStatus("unavailable");
        }
      });

    return () => {
      void realtimeClient.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  return status;
}
