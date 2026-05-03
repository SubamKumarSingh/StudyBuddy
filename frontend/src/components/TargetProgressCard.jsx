import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-orange-50 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-orange-600">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function TargetProgressCard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ai/targets/current/")
      .then((res) => setOverview(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const target = overview?.target;
  const benchmark = overview?.benchmark;

  const progress = useMemo(() => {
    if (!target) return 0;
    return Math.round(target.progress_percent || 0);
  }, [target]);

  if (loading) {
    return (
      <DelayedHoverExplain
        title="Learning target"
        body="This card connects your goal, the daily pace, and the next milestone into one place while the target loads."
        detailRows={[
          { label: "What it shows", value: "Goal, pace, and milestone" },
          { label: "Why it matters", value: "Keeps your plan visible" },
        ]}
      >
        {(open) => (
          <div className={`rounded-3xl border border-orange-100 bg-white p-6 shadow-sm ${open ? "ring-2 ring-orange-100" : ""}`}>
            <div className="h-5 w-40 rounded-full bg-orange-100 animate-pulse" />
            <div className="mt-4 h-24 rounded-2xl bg-orange-50 animate-pulse" />
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  if (!target) {
    return (
      <DelayedHoverExplain
        title="Learning target"
        body="Set a target so StudyBuddy can build a daily pace, compare you against a benchmark, and suggest the next milestone."
        detailRows={[
          { label: "Recommended action", value: "Create a target" },
          { label: "Result", value: "Daily pace + milestone" },
        ]}
      >
        {(open) => (
          <div className={`rounded-3xl border border-orange-100 bg-white p-6 shadow-sm ${open ? "ring-2 ring-orange-100" : ""}`}>
            <p className="text-sm font-medium text-orange-600">Learning target</p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900">
              No target set yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Add a natural-language goal so StudyBuddy can turn it into a data-backed
              pace and a daily plan.
            </p>
            <button
              onClick={() => navigate("/dashboard/onboarding")}
              className="mt-5 rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Set learning target
            </button>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  const milestone = target.next_milestone || target.milestones?.[0];

  return (
    <DelayedHoverExplain
      title={target.title}
      body="This block turns the current learning target into a readable plan: what you are aiming for, how fast to move, and what milestone comes next."
      detailRows={[
        { label: "Daily pace", value: `${target.recommended_minutes_per_day} min/day` },
        { label: "Weekly rhythm", value: `${target.recommended_sessions_per_week} sessions` },
        { label: "Benchmark size", value: `${benchmark?.sample_size || 0} learners` },
        { label: "Next milestone", value: milestone?.title || "No milestone loaded" },
      ]}
    >
      {(open) => (
        <div className={`relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-sm ${open ? "ring-2 ring-orange-100" : ""}`}>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />

          <div className="relative space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-orange-600">Learning target</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  {target.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  {target.goal_summary}
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.18em] text-orange-600">
                  Progress
                </div>
                <div className="text-3xl font-semibold text-gray-900">{progress}%</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <StatPill
                label="Pace"
                value={`${target.recommended_minutes_per_day} min/day`}
              />
              <StatPill
                label="Sessions"
                value={`${target.recommended_sessions_per_week}/week`}
              />
              <StatPill
                label="Benchmark"
                value={`${benchmark?.sample_size || 0} learners`}
              />
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-orange-600">
                Next milestone
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {milestone?.title || "No milestone loaded"}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {milestone?.description ||
                  "We will generate a more detailed path once the target is saved."}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/dashboard/onboarding")}
                className="rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Refine target
              </button>
            </div>
          </div>
        </div>
      )}
    </DelayedHoverExplain>
  );
}
