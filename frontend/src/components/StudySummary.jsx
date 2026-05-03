// import { useEffect, useState } from "react";
// import api from "../api/axios";

// export default function StudySummary() {

//   const [summary, setSummary] = useState(null);

//   useEffect(() => {
//     api.get("/tracking/summary/")
//       .then(res => setSummary(res.data))
//       .catch(err => console.error("Summary error", err));
//   }, []);

//   if (!summary) return <p>Loading summary...</p>;

//   const formatTime = (seconds) => {
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     return `${hrs}h ${mins}m`;
//   };

//   return (
//     <div style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "20px" }}>
//       <h2>Study Summary</h2>

//       <p>
//         <strong>Today:</strong>{" "}
//         {formatTime(summary.today.effective_seconds)} ·{" "}
//         {summary.today.sessions} sessions
//       </p>

//       <p>
//         <strong>This Week:</strong>{" "}
//         {formatTime(summary.this_week.effective_seconds)} ·{" "}
//         {summary.this_week.sessions} sessions
//       </p>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import api from "../api/axios";
import DelayedHoverExplain from "./ui/DelayedHoverExplain";

export default function StudySummary() {

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/tracking/summary/")
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary error", err));
  }, []);

  if (!summary) {
    return (
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="h-32 rounded-3xl bg-orange-100 animate-pulse"></div>
        <div className="h-32 rounded-3xl bg-orange-100 animate-pulse"></div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <DelayedHoverExplain
      className="mb-10"
      title="Study summary"
      body="This section gives you a quick snapshot of time spent today and this week so you can see whether your study rhythm is staying consistent."
      detailRows={[
        { label: "Purpose", value: "Daily and weekly study snapshot" },
        { label: "Use it for", value: "Quick progress checks" },
      ]}
    >
      {(open) => (
        <div className="grid sm:grid-cols-2 gap-8">

          {/* TODAY CARD */}
          <div className={`relative bg-white rounded-3xl p-8 shadow-md border border-orange-100 hover:shadow-xl transition overflow-hidden group ${open ? "ring-2 ring-orange-100" : ""}`}>

            {/* Glow Accent */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-400 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition"></div>

            <div className="relative">
              <p className="text-sm text-gray-500 mb-2">
                Today
              </p>

              <h2 className="text-4xl font-bold text-gray-800">
                {formatTime(summary.today.effective_seconds)}
              </h2>

              <p className="mt-3 text-sm text-orange-600 font-medium">
                {summary.today.sessions} sessions completed
              </p>
            </div>

          </div>

          {/* WEEK CARD */}
          <div className={`relative bg-linear-to-br from-orange-500 to-red-500 text-white rounded-3xl p-8 shadow-xl hover:scale-[1.02] transition ${open ? "ring-2 ring-orange-100" : ""}`}>

            <p className="text-sm text-orange-100 mb-2">
              This Week
            </p>

            <h2 className="text-4xl font-bold">
              {formatTime(summary.this_week.effective_seconds)}
            </h2>

            <p className="mt-3 text-sm text-orange-100">
              {summary.this_week.sessions} sessions completed
            </p>

          </div>

        </div>
      )}
    </DelayedHoverExplain>
  );
}
