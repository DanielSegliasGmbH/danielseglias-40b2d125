import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

interface ChatDrawerContextValue {
  open: boolean;
  prefillMessage: string | null;
  openChat: (prefillMessage?: string) => void;
  setOpen: (open: boolean) => void;
  consumePrefill: () => string | null;
}

const ChatDrawerContext = createContext<ChatDrawerContextValue | null>(null);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [prefillMessage, setPrefillMessage] = useState<string | null>(null);

  const openChat = useCallback((message?: string) => {
    if (message) setPrefillMessage(message);
    setOpen(true);
  }, []);

  const consumePrefill = useCallback(() => {
    const msg = prefillMessage;
    setPrefillMessage(null);
    return msg;
  }, [prefillMessage]);

  const value = useMemo(
    () => ({ open, prefillMessage, openChat, setOpen, consumePrefill }),
    [open, prefillMessage, openChat, consumePrefill]
  );

  return <ChatDrawerContext.Provider value={value}>{children}</ChatDrawerContext.Provider>;
}

export function useChatDrawer() {
  const ctx = useContext(ChatDrawerContext);
  if (!ctx) {
    // Safe fallback when used outside provider — no-op
    return {
      open: false,
      prefillMessage: null,
      openChat: () => {},
      setOpen: () => {},
      consumePrefill: () => null,
    } as ChatDrawerContextValue;
  }
  return ctx;
}
