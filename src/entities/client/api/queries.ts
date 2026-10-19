import { useQuery } from "@tanstack/react-query";
import { getClients, getMessages } from "./client-api";
import { useInboxStore } from "@/features/inbox/model/inbox-store";

export function useClientsQuery() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: ({ signal }) => getClients(signal),
  });
}

export function useMessagesQuery() {
  const selectedClientId = useInboxStore((state) => state.selectedClientId);

  return useQuery({
    queryKey: ["messages", selectedClientId],
    queryFn: ({ signal }) => getMessages(selectedClientId!, signal),
    enabled: selectedClientId !== null,
  });
}
