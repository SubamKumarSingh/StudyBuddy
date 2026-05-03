import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

function formatTimeLabel(item) {
  if (item.is_due) {
    return item.overdue_hours > 0
      ? `Overdue by ${item.overdue_hours}h`
      : "Due now";
  }

  return `Due in ${item.due_in_hours}h`;
}

export default function ReviewQueueCard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadQueue = () => {
    api.get("/tracking/reviews/queue/").then((res) => setQueue(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const completeReview = async (pdfId) => {
    setBusyId(pdfId);
    try {
      await api.post(`/tracking/reviews/${pdfId}/complete/`, {
        score: 0.9,
      });
      loadQueue();
    } catch (err) {
      console.error("Failed to complete review", err);
    } finally {
      setBusyId(null);
    }
  };

  if (!queue) {
    return (
      <DelayedHoverExplain
        title="Review scheduler"
        body="This card shows what is due next so you can keep spaced repetition moving without having to hunt for the next item."
        detailRows={[
          { label: "Purpose", value: "Surface due and upcoming reviews" },
          { label: "Use it for", value: "Quick review decisions" },
        ]}
      >
        {(open) => (
          <div className={`rounded-3xl border border-orange-100 bg-white p-6 shadow-sm ${open ? "ring-2 ring-orange-100" : ""}`}>
            <div className="h-6 w-40 rounded-full bg-orange-100 animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-20 rounded-2xl bg-orange-50 animate-pulse" />
              <div className="h-20 rounded-2xl bg-orange-50 animate-pulse" />
            </div>
          </div>
        )}
      </DelayedHoverExplain>
    );
  }

  return (
    <DelayedHoverExplain
      title="Review scheduler"
      body="This card organizes due and upcoming material so the user always knows what should be reviewed next and why it matters."
      detailRows={[
        { label: "Purpose", value: "Prioritize review items" },
        { label: "Use it for", value: "Spaced repetition planning" },
      ]}
    >
      {(open) => (
        <div className={`rounded-3xl border border-orange-100 bg-white p-6 shadow-sm ${open ? "ring-2 ring-orange-100" : ""}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Review scheduler</p>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                Due for review
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {queue.due_count > 0
                  ? `${queue.due_count} item${queue.due_count === 1 ? "" : "s"} are ready right now.`
                  : "No items are due right now. You’re on track."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-orange-50 px-4 py-3">
                <div className="text-gray-500">Due now</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">
                  {queue.due_count}
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-gray-500">Upcoming</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">
                  {queue.upcoming_count}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {(queue.due_items.length > 0 ? queue.due_items : queue.upcoming_items)
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {item.pdf_title}
                        </h4>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                          {item.mastery_level}% mastery
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatTimeLabel(item)} · interval {item.interval_days} day
                        {item.interval_days === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/study/${item.pdf_id}`)}
                        className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50"
                      >
                        Review now
                      </button>
                      <button
                        onClick={() => completeReview(item.pdf_id)}
                        disabled={busyId === item.pdf_id}
                        className="rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === item.pdf_id ? "Saving..." : "Mark reviewed"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {!queue.due_items.length && queue.upcoming_items.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-5 text-sm text-gray-600">
              Study a PDF or finish an MCQ to create your first review item.
            </div>
          )}
        </div>
      )}
    </DelayedHoverExplain>
  );
}
