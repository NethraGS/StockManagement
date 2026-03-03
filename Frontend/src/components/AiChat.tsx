import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

/* ── types ──────────────────────────────────────────────────── */

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  financeRelated?: boolean;
}

/* ── message bubble ─────────────────────────────────────────── */

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";
  const isNonFinance = !isUser && message.financeRelated === false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                    ${isUser
                      ? "bg-primary/15 text-primary"
                      : isNonFinance
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400"
                    }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : isNonFinance
                        ? "bg-red-950/30 border border-red-500/30 text-red-400 rounded-tl-sm"
                        : "bg-card border border-border text-foreground rounded-tl-sm"
                    }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
};

/* ── typing indicator ───────────────────────────────────────── */

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="flex items-start gap-3"
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
      <Bot className="h-4 w-4 text-violet-400" />
    </div>
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Thinking…</span>
    </div>
  </motion.div>
);

/* ── suggested prompts ──────────────────────────────────────── */

const SUGGESTIONS = [
  "What is SIP?",
  "Explain mutual funds",
  "How does stock market work?",
  "What is Nifty 50?",
  "Risk vs return explained",
  "How to start investing?",
];

/* ── main chat component ────────────────────────────────────── */

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* auto-scroll to latest message */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* generate a unique id */
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  /* send a message */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = { id: uid(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!res.ok) throw new Error("API error");

        const data: { reply: string; financeRelated: boolean } = await res.json();

        const aiMsg: Message = {
          id: uid(),
          role: "ai",
          content: data.reply,
          financeRelated: data.financeRelated,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        /* Fallback if backend is unreachable */
        const aiMsg: Message = {
          id: uid(),
          role: "ai",
          content: "Sorry, I couldn't reach the server. Please try again.",
          financeRelated: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card/40 backdrop-blur-md overflow-hidden">
      {/* Chat area — scrolls internally */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 scroll-smooth"
      >
        {/* Empty state */}
        {isEmpty && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-3">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-foreground mb-0.5">Ask me anything about investing</p>
            <p className="text-[11px] text-muted-foreground mb-4 max-w-xs">
              Terms, concepts, strategies — I'm here to help.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] text-muted-foreground
                             transition-all duration-200 hover:border-primary/30 hover:text-foreground hover:bg-card"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
      </div>

      {/* Input bar — pinned at bottom */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-background/40 px-3 py-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          disabled={isLoading}
          className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground
                     placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40
                     focus:border-primary/40 transition-shadow disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground
                     transition-all duration-200 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default AiChat;
