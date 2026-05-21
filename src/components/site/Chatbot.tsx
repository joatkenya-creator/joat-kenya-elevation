import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { chatCompletion, type ChatMessageT } from "@/lib/chat";

type Msg = { role: "bot" | "user"; text: string };

const FALLBACK_REPLY =
  "I'm having a moment — but our team isn't. Drop your question in the Contact form below or call +254142378150 and we'll respond within 24 hours.";

const INITIAL_GREETING =
  "Hi there! I'm JACK, J.O.A.T. Kenya's assistant. I can help you apply for roles, explore representation, or connect your organisation with the right talent.";

const QUICK_REPLIES = [
  { label: "I want to apply", message: "I want to apply for a role" },
  { label: "My company wants to hire", message: "My company is looking to hire" },
  { label: "Tell me about JOAT", message: "Tell me about J.O.A.T. Kenya" },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: INITIAL_GREETING }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, open, pending]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setShowQuickReplies(false);
    setInput("");

    const nextMsgs: Msg[] = [...msgs, { role: "user", text: trimmed }];
    setMsgs(nextMsgs);
    setPending(true);

    const history: ChatMessageT[] = nextMsgs
      .filter((m) => m.role === "user" || m.role === "bot")
      .slice(-12)
      .map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      }));

    try {
      const result = await chatCompletion(history);
      setMsgs((m) => [...m, { role: "bot", text: result.reply }]);
    } catch (err) {
      console.error("Chat call failed", err);
      setMsgs((m) => [...m, { role: "bot", text: FALLBACK_REPLY }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-linear-to-br from-(--joat-red) to-(--joat-gold) shadow-2xl flex items-center justify-center text-white glow-red"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-120 glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden border-(--joat-gold)/30"
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-linear-to-r from-(--joat-red)/20 to-(--joat-gold)/10">
              <div className="w-9 h-9 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) font-bold flex items-center justify-center">
                J
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">JACK</div>
                <div className="text-[10px] text-gold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--joat-gold) animate-pulse" />{" "}
                  J.O.A.T. Kenya Assistant
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-(--joat-red) text-primary-foreground rounded-br-sm"
                        : "bg-white/5 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] text-sm px-3 py-2 rounded-2xl bg-white/5 text-muted-foreground rounded-bl-sm inline-flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-(--joat-gold)" />
                    Thinking…
                  </div>
                </div>
              )}

              {showQuickReplies && !pending && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => void sendMessage(q.message)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-(--joat-gold)/45 text-foreground hover:bg-(--joat-navy-deep) hover:text-(--joat-gold) hover:border-(--joat-gold) transition-colors"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                disabled={pending}
                placeholder={pending ? "Sending…" : "Ask anything…"}
                className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-(--joat-gold)/50 disabled:opacity-60"
              />
              <button
                onClick={() => void sendMessage(input)}
                disabled={pending || !input.trim()}
                aria-label="Send"
                className="w-10 h-10 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) flex items-center justify-center hover:brightness-110 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
