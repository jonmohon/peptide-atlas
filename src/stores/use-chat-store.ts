import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  prefillText: string;
  setOpen: (open: boolean) => void;
  openWithText: (text: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  prefillText: '',
  setOpen: (open) => set({ isOpen: open }),
  openWithText: (text) => set({ isOpen: true, prefillText: text }),
}));
