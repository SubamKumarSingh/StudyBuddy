import { useEffect, useState } from "react";
import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

export default function FocusCard() {
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    api.get("/ai/focus-state/")
      .then(res => setFocus(res.data))
      .catch(() => {});
  }, []);

  if (!focus) {
    return (
      <DelayedHoverExplain
        title="Focus score"
        body="This card summarizes how steady your study behavior has been so you can tell if your sessions are drifting or getting more consistent."
        detailRows={[
          { label: "Purpose", value: "Show current focus level" },
          { label: "Signals used", value: "Consistency, engagement, recency" },
        ]}
      >
        {(open) => (
          <div className={`bg-white rounded-3xl p-8 shadow border border-orange-100 ${open ? "ring-2 ring-orange-100" : ""}`}>
            <p className="text-sm text-gray-400">Analyzing your study patterns…</p>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  return (
    <DelayedHoverExplain
      title="Focus score"
      body="This card translates your recent behavior into one focus signal so you can understand whether you are in a strong study rhythm or need a reset."
      detailRows={[
        { label: "Purpose", value: "Explain current focus quality" },
        { label: "What moves it", value: "Consistency, engagement, recency" },
      ]}
    >
      {(open) => (
        <div className={`bg-white rounded-3xl p-8 shadow border border-orange-100 ${open ? "ring-2 ring-orange-100" : ""}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Focus Score
            </h3>
            <span className="text-3xl font-bold text-orange-500">
              {focus.focus_score}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {focus.explanation}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Consistency</span>
              <span>{focus.consistency}%</span>
            </div>
            <div className="flex justify-between">
              <span>Engagement</span>
              <span>{focus.engagement}%</span>
            </div>
            <div className="flex justify-between">
              <span>Recency</span>
              <span>{focus.recency}%</span>
            </div>
          </div>
        </div>
      )}
    </DelayedHoverExplain>
  );
}
