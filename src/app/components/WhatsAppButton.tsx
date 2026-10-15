import { createContext, useContext, useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '../../config/site';

const DEFAULT_MESSAGE = 'Hello, I am interested in learning more about your properties.';

const MessageContext = createContext<{ message: string | null; setMessage: (message: string | null) => void }>({
  message: null,
  setMessage: () => {},
});

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  return <MessageContext.Provider value={{ message, setMessage }}>{children}</MessageContext.Provider>;
}

// Lets a page, such as a property, say what the floating button's message is about
export function usePageWhatsAppMessage(message: string | null) {
  const { setMessage } = useContext(MessageContext);
  useEffect(() => {
    setMessage(message);
    return () => setMessage(null);
  }, [message]);
}

export function WhatsAppButton({ className = '' }: { className?: string }) {
  const { message } = useContext(MessageContext);

  return (
    <a
      href={whatsappUrl(message ?? DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group fixed bottom-6 right-6 z-50 items-center rounded-full bg-brand-green p-4 text-white shadow-lg outline-none transition-all duration-300 hover:scale-110 hover:bg-brand-green-hover hover:shadow-xl focus-visible:ring-4 focus-visible:ring-brand-green-bright/50 ${className || 'flex'}`}
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
