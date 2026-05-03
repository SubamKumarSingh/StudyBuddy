import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import StudyHeatmap from "../components/StudyHeatmap";
import FocusHistoryChart from "../components/FocusHistoryChart";
import AIInsights from "../components/AIInsights";
import DelayedHoverExplain from "../components/ui/DelayedHoverExplain";

export default function Analytics() {
  const [studyData, setStudyData] = useState([]);
  const [focus, setFocus] = useState(null);
  const [content, setContent] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    api.get("/analytics/study-time/").then((res) => setStudyData(res.data));
    api.get("/analytics/focus/").then((res) => setFocus(res.data));
    api.get("/analytics/content/").then((res) => setContent(res.data));
    api.get("/analytics/global/").then((res) => setGlobalStats(res.data));
  }, []);

  return (
    <div className="space-y-10 p-8">
      <h1 className="text-3xl font-semibold">Learning Analytics</h1>

      <DelayedHoverExplain
        title="Weekly study time"
        body="This chart gives a quick view of how much study time the user is putting in each day so they can spot streaks, dips, and steady progress."
        detailRows={[
          { label: "Purpose", value: "Show weekly study volume" },
          { label: "Use it for", value: "Catch consistency trends" },
        ]}
      >
        {(open) => (
          <div className={`rounded-xl bg-white p-6 shadow ${open ? "ring-2 ring-orange-100" : ""}`}>
            <h2 className="mb-4 text-lg">Weekly Study Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </DelayedHoverExplain>

      {focus && <FocusCard focus={focus} />}

      <DelayedHoverExplain
        title="Resource difficulty"
        body="This chart shows how hard the tracked resources are so the user can balance easier and harder materials in their study plan."
        detailRows={[
          { label: "Purpose", value: "Compare content difficulty" },
          { label: "Use it for", value: "Plan what to study next" },
        ]}
      >
        {(open) => (
          <div className={`rounded-xl bg-white p-6 shadow ${open ? "ring-2 ring-orange-100" : ""}`}>
            <h2 className="mb-4 text-lg">Resource Difficulty</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={content}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="difficulty_percent" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DelayedHoverExplain>

      <div className="grid gap-6 md:grid-cols-2">
        {content.map((item, i) => (
          <DifficultyCard key={i} resource={item} />
        ))}
      </div>

      {globalStats && (
        <DelayedHoverExplain
          title="Community insights"
          body="This panel compares the user against the broader learner base so they can understand whether their pace and focus are above or below the norm."
          detailRows={[
            { label: "Purpose", value: "Benchmark against other learners" },
            { label: "Use it for", value: "Context and motivation" },
          ]}
        >
          {(open) => (
            <div className={`rounded-xl bg-white p-6 shadow ${open ? "ring-2 ring-orange-100" : ""}`}>
              <h2 className="mb-4 text-lg">Community Insights</h2>
              <p>
                Average study session across learners:
                <strong> {globalStats.avg_session} minutes</strong>
              </p>
              <p>
                Average learner focus score:
                <strong> {globalStats.avg_focus}</strong>
              </p>
              <p>
                You are studying
                <strong> {globalStats.user_vs_global}</strong>
                compared to other learners.
              </p>
            </div>
          )}
        </DelayedHoverExplain>
      )}

      <div className="space-y-10">
        <StudyHeatmap />
        <FocusHistoryChart />
        <AIInsights />
      </div>
    </div>
  );
}

function FocusCard({ focus }) {
  return (
    <DelayedHoverExplain
      title="Focus insights"
      body="This card turns the user’s focus metrics into a readable summary so they can understand what is driving their score."
      detailRows={[
        { label: "Purpose", value: "Explain focus performance" },
        { label: "Signals", value: "Consistency, engagement, recency" },
      ]}
    >
      {(open) => (
        <div className={`rounded-xl bg-white p-6 shadow ${open ? "ring-2 ring-orange-100" : ""}`}>
          <h2 className="mb-4 text-lg">Focus Insights</h2>
          <div className="text-3xl font-bold">{focus.focus_label}</div>
          <div className="mt-1 text-sm text-gray-500">{focus.focus_score}% focus score</div>
          <div className="mt-4 space-y-1 text-sm">
            <p>Why?</p>
            <p>• Studied {focus.consistency}% of the last week</p>
            <p>• Engagement level {focus.engagement}%</p>
            <p>• Recency score {focus.recency}%</p>
          </div>
          <div className="mt-4 text-sm text-gray-500">{focus.explanation}</div>
        </div>
      )}
    </DelayedHoverExplain>
  );
}

function DifficultyCard({ resource }) {
  return (
    <DelayedHoverExplain
      title="Difficulty explanation"
      body="This card explains why a specific resource is harder or easier so the user knows how to approach it in the next study session."
      detailRows={[
        { label: "Purpose", value: "Explain one resource score" },
        { label: "Use it for", value: "Choose study strategy" },
      ]}
    >
      {(open) => (
        <div className={`rounded-xl bg-white p-6 shadow ${open ? "ring-2 ring-orange-100" : ""}`}>
          <h3 className="font-semibold">{resource.name}</h3>
          <div className="mt-2 text-lg">
            Difficulty:
            <strong> {resource.difficulty_label}</strong>
            <span className="ml-2 text-gray-500">({resource.difficulty_percent}%)</span>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <p>Why?</p>
            {resource.reasons.map((r, i) => (
              <p key={i}>• {r}</p>
            ))}
          </div>
        </div>
      )}
    </DelayedHoverExplain>
  );
}
