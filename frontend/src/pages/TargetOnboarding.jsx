import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const EXAMPLES = [
  "I want to study consistently for 30 minutes a day.",
  "I want to improve my quiz accuracy to 80%.",
  "I want to finish one learning topic each week.",
];

function MetricRow({ label, value, tone = "text-gray-900" }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold text-right ${tone}`}>{value}</span>
    </div>
  );
}

export default function TargetOnboarding() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [rawText, setRawText] = useState("");
  const [interpretation, setInterpretation] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const loadCurrent = async () => {
    setLoadingCurrent(true);
    try {
      const res = await api.get("/ai/targets/current/");
      setCurrentTarget(res.data.target);
      setBenchmark(res.data.benchmark);
      if (res.data.target?.raw_text) {
        setRawText(res.data.target.raw_text);
      }
    } catch (err) {
      console.error("Target load failed", err);
    } finally {
      setLoadingCurrent(false);
    }
  };

  useEffect(() => {
    loadCurrent();
  }, []);

  const progress = useMemo(() => {
    if (!currentTarget) return 0;
    return Math.round(currentTarget.progress_percent || 0);
  }, [currentTarget]);

  const handleInterpret = async (e) => {
    e.preventDefault();
    setError("");
    setWorking(true);
    try {
      const res = await api.post("/ai/targets/interpret/", {
        raw_text: rawText,
      });
      setInterpretation(res.data.interpretation);
      setBenchmark(res.data.benchmark);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "We could not interpret that target yet. Try a more direct sentence."
      );
    } finally {
      setWorking(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    setWorking(true);
    try {
      await api.post("/ai/targets/", {
        raw_text: rawText,
        replace_current: true,
      });

      await refreshUser();
      await loadCurrent();
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "We could not save that target. Please try again."
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border border-orange-100 bg-linear-to-r from-white to-orange-50 p-6 shadow-sm">
        <p className="text-sm font-medium text-orange-600">Learning target</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
          Tell StudyBuddy what you want to achieve
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Write your goal in plain language. We’ll interpret it, compare it with
          data from similar learners, and turn it into a pace that can adapt as
          you improve.
        </p>
      </div>

      {currentTarget && (
        <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-green-600">Current target</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                {currentTarget.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                {currentTarget.goal_summary}
              </p>
            </div>
            <div className="rounded-2xl bg-green-50 px-4 py-3 text-right">
              <div className="text-xs uppercase tracking-[0.18em] text-green-600">
                Progress
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {progress}%
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <form onSubmit={handleInterpret} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Your target
              </span>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={6}
                placeholder="Example: I want to finish calculus in 6 weeks and study 45 minutes a day."
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={working || !rawText.trim()}
                className="rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {working ? "Interpreting..." : "Interpret target"}
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={working || !rawText.trim()}
                className="rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save and use this target
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="mb-3 text-sm font-medium text-gray-700">
              Try one of these
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setRawText(example)}
                  className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-gray-700 transition hover:bg-orange-100"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                AI interpretation
              </h3>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <MetricRow
                label="Target type"
                value={interpretation?.goal_type?.replace("_", " ") || "Awaiting input"}
              />
              <MetricRow
                label="Subject"
                value={interpretation?.subject || "—"}
              />
              <MetricRow
                label="Horizon"
                value={
                  interpretation?.time_horizon_days
                    ? `${interpretation.time_horizon_days} days`
                    : "—"
                }
              />
              <MetricRow
                label="Suggested pace"
                value={
                  interpretation?.recommended_minutes_per_day
                    ? `${interpretation.recommended_minutes_per_day} min/day`
                    : "—"
                }
              />
              <MetricRow
                label="Confidence"
                value={
                  interpretation?.ai_confidence
                    ? `${Math.round(interpretation.ai_confidence * 100)}%`
                    : "—"
                }
              />
            </div>

            {interpretation?.goal_summary && (
              <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-gray-700">
                {interpretation.goal_summary}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Data-backed benchmark
            </h3>
            <div className="mt-4 space-y-3">
              <MetricRow
                label="Similar learners"
                value={benchmark?.sample_size ?? 0}
              />
              <MetricRow
                label="Median days"
                value={benchmark?.median_days_to_completion
                  ? Math.round(benchmark.median_days_to_completion)
                  : "—"}
              />
              <MetricRow
                label="Recommended pace"
                value={
                  benchmark?.recommended_minutes_per_day
                    ? `${Math.round(benchmark.recommended_minutes_per_day)} min/day`
                    : "—"
                }
              />
              <MetricRow
                label="Weekly sessions"
                value={
                  benchmark?.recommended_sessions_per_week
                    ? `${Math.round(benchmark.recommended_sessions_per_week)}`
                    : "—"
                }
              />
              <MetricRow
                label="Completion rate"
                value={
                  benchmark?.completion_rate
                    ? `${Math.round(benchmark.completion_rate * 100)}%`
                    : "—"
                }
              />
            </div>
          </section>

          {loadingCurrent && (
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm text-sm text-gray-500">
              Loading your current target...
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
