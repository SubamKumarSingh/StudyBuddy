import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function AITutor() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  // 🔹 Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  // 🔹 Initial tutor message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Let’s do a quick revision. What topic do you want help with?"
      }
    ]);
  }, []);

  // 🔹 Send message
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: text }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/knowledge/chat/tutor/", {
        question: text,
        history: newMessages
      });

      setMessages([
        ...newMessages,
        { role: "assistant", content: res.data.answer }
      ]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-orange-50 p-6">

      <div className="max-w-4xl mx-auto flex flex-col h-[85vh]">

        {/* 🔹 Header */}
        <h1 className="text-3xl font-bold text-orange-600 mb-4">
          AI Tutor
        </h1>

        {/* 🔹 Context Banner */}
        <div className="bg-white p-4 rounded-xl shadow mb-3 text-sm text-gray-700">
          You’re improving your weak areas. Let’s keep this interactive.
        </div>

        {/* 🔹 Chat Area */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto bg-white p-4 rounded-xl shadow space-y-3"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[75%]
                ${m.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-sm text-gray-400">Tutor is typing...</p>
          )}
        </div>

        {/* 🔹 Quick Actions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => sendMessage("Explain my weak topic")}
            className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
          >
            Explain
          </button>

          <button
            onClick={() => sendMessage("Ask me a quick question")}
            className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
          >
            Test Me
          </button>

          <button
            onClick={() => sendMessage("Summarize what I studied recently")}
            className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
          >
            Summarize
          </button>
        </div>

        {/* 🔹 Input */}
        <div className="flex mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor..."
            className="flex-1 border p-3 rounded-l-xl focus:outline-orange-400"
          />

          <button
            onClick={() => sendMessage(input)}
            className="bg-orange-500 text-white px-5 rounded-r-xl hover:bg-orange-600"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}