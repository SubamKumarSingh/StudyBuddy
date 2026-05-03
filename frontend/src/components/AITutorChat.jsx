import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import api from "../api/axios";

export default function AITutorChat({ pdfId }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask me anything about this study material. I can explain concepts, quiz you, or help summarize a section.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const question = input;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/knowledge/chat/", {
        question,
        pdf_id: pdfId,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn’t answer that right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };



  return (
    <div className="flex h-[34rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-600">AI tutor</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Your Study companion</h3>
          </div>
          
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ask questions, request summaries, or get a quick understanding check without leaving the reading flow.
        </p>
      </div>

      {/* <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div> */}

      <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                msg.role === "user"
                  ? "bg-orange-600 text-white"
                  : "border border-slate-100 bg-[#f8faf7] text-slate-700"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && <div className="text-sm text-slate-400">AI is thinking...</div>}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this PDF..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
