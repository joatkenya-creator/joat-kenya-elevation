import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "bot" | "user"; text: string };

const intents: { match: RegExp; reply: string }[] = [
  { match: /biobiz/i, reply: "Biobiz is our mobile business toolkit — inventory, sales, M-Pesa payments, all offline-friendly. Download it from the Play Store, or I can connect you with our team." },
  { match: /majobo|talent|hir(e|ing)|recruit/i, reply: "Majobo Kenya provides pre-vetted talent and managed workforce solutions across East Africa. Want to brief us on a role? Head to the Contact section and pick 'Talent Sourcing'." },
  { match: /amare|kids|children|story/i, reply: "Amare's Big Planet is our flagship EdTech world for ages 4–12 — story-led learning that celebrates African identity." },
  { match: /roblox|game/i, reply: "We build educational Roblox experiences and custom gamified learning systems. Tap 'Explore Solutions' for examples." },
  { match: /education|training|bootcamp|course/i, reply: "Our Digital Education programs cover developer bootcamps, corporate digital literacy and youth STEM. I can route you to the training team." },
  { match: /career|job|apply|intern/i, reply: "Open roles live in the Careers section — and we keep an always-open talent pool for any profession. Search there or click 'Apply Now'." },
  { match: /contact|email|phone|call|reach/i, reply: "You can reach us at +254 729 265 333, email hello@joatkenya.com, or use the Contact form below." },
  { match: /partner|invest|collaborat/i, reply: "Love that. Use 'Partner With Us' in the nav — we'll connect you with the right team within one business day." },
  { match: /price|cost|quote/i, reply: "Pricing depends on scope. Drop your details in the Contact form and we'll send tailored options within 24 hours." },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi 👋 I'm JACK, JOAT KENYA's assistant. Ask about our products, services, careers — or how to partner with us." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const reply =
      intents.find((i) => i.match.test(t))?.reply ??
      "Great question — let me connect you with our team. Drop your details in the Contact form and we'll respond within 24 hours.";
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--joat-red)] to-[var(--joat-gold)] shadow-2xl flex items-center justify-center text-white glow-red"
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
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[28rem] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border-[var(--joat-gold)]/30"
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-[var(--joat-red)]/20 to-[var(--joat-gold)]/10">
              <div className="w-9 h-9 rounded-full bg-[var(--joat-gold)] text-[var(--joat-navy-deep)] font-bold flex items-center justify-center">J</div>
              <div>
                <div className="font-bold text-foreground text-sm">JACK</div>
                <div className="text-[10px] text-gold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--joat-gold)] animate-pulse" /> Online
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl ${
                    m.role === "user"
                      ? "bg-[var(--joat-red)] text-primary-foreground rounded-br-sm"
                      : "bg-white/5 text-foreground rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[var(--joat-gold)]/50"
              />
              <button onClick={send} aria-label="Send" className="w-10 h-10 rounded-md bg-[var(--joat-gold)] text-[var(--joat-navy-deep)] flex items-center justify-center hover:brightness-110">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
