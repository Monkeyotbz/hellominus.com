import { createContext, useContext, useMemo, useState } from "react";

// Estado compartido mínimo (abierto/cerrado) entre ChatWidget.jsx y cualquier
// CTA que deba abrir el chat (ej. Hero.jsx). El proyecto no usa ningún store
// global — Context alcanza para dos componentes que no son padre/hijo directo.
const ChatWidgetCtx = createContext(null);

export function ChatWidgetProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      openChat: () => setIsOpen(true),
      closeChat: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return <ChatWidgetCtx.Provider value={value}>{children}</ChatWidgetCtx.Provider>;
}

export function useChatWidget() {
  const ctx = useContext(ChatWidgetCtx);
  if (!ctx) throw new Error("useChatWidget debe usarse dentro de ChatWidgetProvider");
  return ctx;
}
