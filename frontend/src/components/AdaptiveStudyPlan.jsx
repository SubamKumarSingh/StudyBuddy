import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

function getStatusTone(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "SKIPPED":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-orange-100 text-orange-600";
  }
}

export default function AdaptiveStudyPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai/study-plan/");
      setPlan(res.data);
    } catch (error) {
      console.error("Plan load failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const regeneratePlan = async () => {
    setBusyAction("regenerate");
    try {
      const res = await api.post("/ai/study-plan/generate/");
      setPlan(res.data);
    } catch (error) {
      console.error("Plan regeneration failed", error);
    } finally {
      setBusyAction(null);
    }
  };

  const handleAction = async (itemId, action) => {
    setBusyAction(`${itemId}:${action}`);
    try {
      const res = await api.post(`/ai/study-plan/items/${itemId}/action/`, {
        action,
      });
      setPlan(res.data.plan);
    } catch (error) {
      console.error("Plan action failed", error);
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <DelayedHoverExplain
        title="Adaptive study planner"
        body="This card builds a day-level study plan so the dashboard can show what to do next instead of just reporting past activity."
        detailRows={[
          { label: "Purpose", value: "Generate a daily study plan" },
          { label: "When it helps", value: "When the user needs a next step" },
        ]}
      >
        {(open) => (
          <div className={`bg-white rounded-3xl p-8 shadow-md border border-orange-100 ${open ? "ring-2 ring-orange-100" : ""}`}>
            <div className="h-6 w-40 rounded-full bg-orange-100 animate-pulse mb-5"></div>
            <div className="space-y-4">
              <div className="h-20 rounded-2xl bg-orange-50 animate-pulse"></div>
              <div className="h-20 rounded-2xl bg-orange-50 animate-pulse"></div>
            </div>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  if (!plan || plan.items.length === 0) {
    return (
      <DelayedHoverExplain
        title="Adaptive study planner"
        body="This card creates a plan when the user has enough activity to prioritize study blocks and keep the day moving."
        detailRows={[
          { label: "Purpose", value: "Generate prioritized study blocks" },
          { label: "Output", value: "Plan summary and actions" },
        ]}
      >
        {(open) => (
          <div className={`bg-white rounded-3xl p-8 shadow-md border border-orange-100 ${open ? "ring-2 ring-orange-100" : ""}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-orange-600 font-medium mb-2">
                  Adaptive Study Planner
                </p>
                <h3 className="text-2xl font-semibold text-gray-800">
                  No plan yet
                </h3>
              </div>
              <button
                onClick={regeneratePlan}
                disabled={busyAction === "regenerate"}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium disabled:opacity-60"
              >
                {busyAction === "regenerate" ? "Generating..." : "Generate Plan"}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {plan?.summary || "Add a few study resources and quiz attempts so the planner can prioritize your day."}
            </p>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  return (
    <DelayedHoverExplain
      title="Adaptive study planner"
      body="This card turns the user’s current state into a sequence of study blocks, helping them know what to do next and why."
      detailRows={[
        { label: "Purpose", value: "Build a prioritized daily plan" },
        { label: "Use it for", value: "Start, complete, or skip study blocks" },
      ]}
    >
      {(open) => (
        <div className={`relative bg-white rounded-3xl p-8 shadow-md border border-orange-100 overflow-hidden ${open ? "ring-2 ring-orange-100" : ""}`}>
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-orange-200/40 blur-3xl"></div>

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-6">
              <div>
                <p className="text-sm text-orange-600 font-medium mb-2">
                  Adaptive Study Planner
                </p>
                <h3 className="text-2xl font-semibold text-gray-800">
                  Today's Plan
                </h3>
                <p className="text-sm text-gray-500 mt-2 max-w-2xl">
                  {plan.summary}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-gray-600">
                  <div className="font-semibold text-gray-800">
                    {plan.completion}% complete
                  </div>
                  <div>{plan.items.length} planned blocks</div>
                </div>
                <button
                  onClick={regeneratePlan}
                  disabled={busyAction === "regenerate"}
                  className="px-4 py-3 rounded-2xl bg-white border border-orange-200 text-sm font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                >
                  {busyAction === "regenerate" ? "Refreshing..." : "Regenerate"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {plan.items.map((item) => {
                const itemBusy = busyAction?.startsWith(`${item.id}:`);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-gray-600">
                            {item.task_type.replace("_", " ")}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusTone(item.status)}`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.estimated_minutes} min
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                        </div>

                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">Why now:</span>{" "}
                          {item.rationale}
                        </div>

                        {(item.pdf_title || item.topic) && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {item.pdf_title && (
                              <span className="px-3 py-1 rounded-full bg-white text-gray-600 border border-orange-100">
                                {item.pdf_title}
                              </span>
                            )}
                            {item.topic && (
                              <span className="px-3 py-1 rounded-full bg-white text-gray-600 border border-orange-100">
                                Topic: {item.topic}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {item.pdf && (
                          <button
                            onClick={() => navigate(item.action_url)}
                            className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow-sm"
                          >
                            Open
                          </button>
                        )}
                        {item.status !== "IN_PROGRESS" && item.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleAction(item.id, "start")}
                            disabled={itemBusy}
                            className="px-4 py-2 rounded-xl bg-white border border-orange-200 text-sm font-medium text-gray-700 disabled:opacity-60"
                          >
                            Start
                          </button>
                        )}
                        {item.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleAction(item.id, "complete")}
                            disabled={itemBusy}
                            className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium disabled:opacity-60"
                          >
                            Complete
                          </button>
                        )}
                        {item.status !== "SKIPPED" && item.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleAction(item.id, "skip")}
                            disabled={itemBusy}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium disabled:opacity-60"
                          >
                            Skip
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DelayedHoverExplain>
  );
}
