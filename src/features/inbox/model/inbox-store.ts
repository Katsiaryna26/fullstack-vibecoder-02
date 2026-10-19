import { create } from "zustand";
import { persist } from "zustand/middleware";

type InboxState = {
  selectedClientId: number | null;
  searchTerm: string;
  setSelectedClientId: (clientId: number | null) => void;
  setSearchTerm: (searchTerm: string) => void;
};

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      selectedClientId: null,
      searchTerm: "",
      setSelectedClientId: (selectedClientId) => set({ selectedClientId }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
    }),
    { name: "relay-inbox" },
  ),
);
