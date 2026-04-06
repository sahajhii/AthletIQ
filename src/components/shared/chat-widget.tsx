import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { useAiChat } from "@/hooks/use-ai";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const aiChat = useAiChat();

  async function handleSubmit() {
    if (!question.trim()) return;
    const current = question;
    const nextHistory = [...messages, { role: "user" as const, content: current }];
    setMessages(nextHistory);
    setQuestion("");
    try {
      const answer = await aiChat.mutateAsync({
        question: current,
        history: nextHistory,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AthletIQ AI is unavailable right now. Please try again shortly.",
        },
      ]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 text-black shadow-glow"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
      {open ? (
        <div className="glass-panel fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-[1.75rem] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">AthletIQ AI</p>
            <h3 className="mt-2 text-xl font-semibold">Ask about products, bundles, or usage</h3>
          </div>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Try: “Which products suit weight loss?”</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl p-3 text-sm ${message.role === "user" ? "bg-primary/15 text-foreground" : "bg-white/8 text-foreground/90"}`}
                >
                  {message.content}
                </div>
              ))
            )}
            {aiChat.isPending ? <div className="rounded-2xl bg-white/8 p-3 text-sm text-foreground/90">Thinking...</div> : null}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask AthletIQ AI"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            <Button size="icon" onClick={() => void handleSubmit()} disabled={aiChat.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
