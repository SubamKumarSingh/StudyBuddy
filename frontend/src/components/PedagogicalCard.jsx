import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

export default function PedagogicalCard() {
  const [decision, setDecision] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/ai/decision/")
      .then(res => setDecision(res.data))
      .catch(() => {});
  }, []);

  if (!decision) {
    return (
      <DelayedHoverExplain
        title="Suggested next step"
        body="This card will eventually tell the user what to do next so the dashboard stays action-oriented instead of purely descriptive."
        detailRows={[
          { label: "Purpose", value: "Suggest the next learning move" },
          { label: "Status", value: "Waiting for model output" },
        ]}
      >
        {(open) => (
          <div className={`bg-white rounded-3xl p-8 shadow border border-orange-100 ${open ? "ring-2 ring-orange-100" : ""}`}>
            <p className="text-sm text-gray-400">
              Thinking about your next step…
            </p>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  if (decision.type === "system") {
    return (
      <DelayedHoverExplain
        title="Suggested next step"
        body="This card helps a new user understand that the app is waiting for study material before it can suggest a smarter action."
        detailRows={[
          { label: "Purpose", value: "Prompt the first setup action" },
          { label: "Action", value: "Add PDFs" },
        ]}
      >
        {(open) => (
          <div className={`bg-white rounded-3xl p-8 shadow border border-orange-100 ${open ? "ring-2 ring-orange-100" : ""}`}>
            <h3 className="text-lg font-semibold mb-2">
              Let’s get started
            </h3>
            <p className="text-gray-600 mb-4">
              {decision.message}
            </p>
            <button
              onClick={() => navigate("/dashboard/pdfs")}
              className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium"
            >
              Add PDFs
            </button>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  return (
    <DelayedHoverExplain
      title="Suggested next step"
      body="This card tells the user what to do next based on their learning state, so the dashboard can stay action-led instead of passive."
      detailRows={[
        { label: "Purpose", value: "Recommend the next action" },
        { label: "Why it appears", value: "Uses recent study patterns" },
      ]}
    >
      {(open) => (
        <div className={`bg-white rounded-3xl p-8 shadow border border-orange-100 space-y-6 ${open ? "ring-2 ring-orange-100" : ""}`}>

          {/* ===== HEADER ===== */}
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full mb-3">
              Suggested next step
            </span>

            <h3 className="text-xl font-semibold text-gray-800">
              {decision.message}
            </h3>
          </div>

          {/* ===== PRIMARY ACTION ===== */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Based on your recent study patterns
            </p>

            <button
              onClick={() =>
                navigate(`/dashboard/study/${decision.pdf_id}`)
              }
              className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:scale-[1.02] transition"
            >
              Open {decision.pdf_title}
            </button>
          </div>

          {/* ===== WHY (EXPLAINABILITY) ===== */}
          <div>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-sm text-orange-600 hover:underline"
            >
              {showWhy ? "Hide reasoning" : "Why this suggestion?"}
            </button>

            {showWhy && (
              <div className="mt-4 bg-orange-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                <div>
                  <strong>Learner state:</strong>{" "}
                  Focus {decision.learner_state.focus_level},{" "}
                  consistency {Math.round(decision.learner_state.consistency * 100)}%
                </div>

                <div>
                  <strong>Content:</strong>{" "}
                  {decision.content_state.difficulty} difficulty,{" "}
                  {decision.content_state.importance} importance
                </div>

                <div>
                  <strong>Strategy:</strong>{" "}
                  {decision.strategy.replace("_", " ")}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </DelayedHoverExplain>
  );
}
