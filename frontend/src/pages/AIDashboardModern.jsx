import { useEffect, useMemo, useRef, useState } from "react";

import api from "../api/axios";

const QUICK_PROMPTS = [
  {
    label: "Explain weak topic",
    prompt:
      "Explain my weakest topic in a simple way and give me one quick check question.",
  },
  {
    label: "Test me",
    prompt:
      "Ask me one question based on my recent study material and wait for my answer.",
  },
  {
    label: "Summarize",
    prompt:
      "Summarize what I studied recently in 5 bullet points and highlight the most important idea.",
  },
  {
    label: "Study plan",
    prompt:
      "Tell me what I should study next and why it matters most today.",
  },
];

function formatPercent(value) {
  return `${Math.round(value || 0)}%`;
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
          isUser
            ? "bg-linear-to-r from-orange-500 to-red-500 text-white rounded-br-md"
            : "bg-white text-gray-700 border border-orange-100 rounded-bl-md",
        ].join(" ")}
      >
        {message.content}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, accent = "from-orange-500 to-red-500" }) {
  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/80 p-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
        {label}
      </div>
      <div
        className={`text-2xl font-semibold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{hint}</div>
    </div>
  );
}

export default function AIDashboardModern() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingPrompt, setSendingPrompt] = useState(null);
  const [focus, setFocus] = useState(null);
  const [decision, setDecision] = useState(null);
  const [plan, setPlan] = useState(null);
  const [target, setTarget] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "I’m ready. Ask me about a topic, a PDF, your weak areas, or what to study next.",
      },
    ]);
  }, []);

  useEffect(() => {
    api.get("/ai/focus-state/").then((res) => setFocus(res.data)).catch(() => {});
    api.get("/ai/decision/").then((res) => setDecision(res.data)).catch(() => {});
    api.get("/ai/study-plan/").then((res) => setPlan(res.data)).catch(() => {});
    api.get("/ai/targets/current/").then((res) => setTarget(res.data)).catch(() => {});
  }, []);

  const contextualHint = useMemo(() => {
    if (!decision) return "A smarter tutor workspace, tuned to your study history.";
    return `Next focus: ${decision.pdf_title || "your most useful study material"}`;
  }, [decision]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/knowledge/chat/tutor/", {
        question: trimmed,
        history: newMessages,
      });

      setMessages([
        ...newMessages,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      console.error("Tutor chat failed", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I couldn’t reach the tutor service just now. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      setSendingPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fff7f3] via-white to-[#fff1ec] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-orange-100 bg-white/70 backdrop-blur px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-medium text-orange-600 mb-2">
                AI Tutor Workspace
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
                Ask, review, and adapt in one place
              </h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-600">
                {contextualHint}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Focus"
                value={focus ? formatPercent(focus.focus_score) : "—"}
                hint={focus ? "Current attention score" : "Loading"}
              />
              <StatCard
                label="Strategy"
                value={
                  decision?.strategy ? decision.strategy.replace("_", " ") : "—"
                }
                hint={decision?.pdf_title || "Suggested next move"}
                accent="from-blue-500 to-cyan-500"
              />
              <StatCard
                label="Plan"
                value={plan ? `${plan.items?.length || 0}` : "—"}
                hint="Tasks for today"
                accent="from-emerald-500 to-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-orange-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-orange-100 bg-linear-to-r from-orange-500 to-red-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-orange-100/90">
                    Conversation
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold">Study assistant</h2>
                </div>
                <div className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                  {loading ? "Thinking..." : "Ready"}
                </div>
              </div>
            </div>

            <div className="flex h-[65vh] flex-col">
              <div
                ref={chatRef}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6"
              >
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-3xl rounded-bl-md border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-gray-500">
                      Tutor is typing
                      <span className="ml-1 inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400 [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-orange-100 bg-orange-50/70 px-4 py-4 md:px-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSendingPrompt(item.label);
                        sendMessage(item.prompt);
                      }}
                      disabled={loading}
                      className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingPrompt === item.label ? "Loading..." : item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder="Ask about a PDF, topic, weak area, or what to study next..."
                    rows={2}
                    className="min-h-[56px] flex-1 resize-none rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Study context
                </h3>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                  Live
                </span>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-gray-500">Current focus score</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {focus ? formatPercent(focus.focus_score) : "Loading"}
                  </div>
                  <div className="mt-1 text-gray-600">
                    {focus?.explanation ||
                      "Analyzing your recent study patterns."}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="text-gray-500">Current target</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {target?.target?.title || "Set one on the Goals page"}
                  </div>
                  <div className="mt-1 text-gray-600">
                    {target?.target?.goal_summary ||
                      "A clear goal makes the tutor and planner much smarter."}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="text-gray-500">Suggested strategy</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {decision?.strategy
                      ? decision.strategy.replace("_", " ")
                      : "Loading"}
                  </div>
                  <div className="mt-1 text-gray-600">
                    {decision?.pdf_title || "Your next material will appear here."}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="text-gray-500">Today’s plan</div>
                  <div className="mt-3 space-y-3">
                    {plan?.items?.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-gray-500">
                            {item.estimated_minutes} min ·{" "}
                            {item.task_type.replace("_", " ")}
                          </div>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {item.status}
                        </span>
                      </div>
                    ))}
                    {!plan?.items?.length && (
                      <div className="text-gray-500">
                        No study plan loaded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-linear-to-br from-white to-orange-50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Suggested ways to use this page
              </h3>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p>
                  Use <strong>Explain weak topic</strong> when you want a clearer
                  summary of the hardest material.
                </p>
                <p>
                  Use <strong>Test me</strong> to force active recall instead of
                  passive reading.
                </p>
                <p>
                  Use <strong>Study plan</strong> when you want the AI to tell you
                  what matters most today.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
