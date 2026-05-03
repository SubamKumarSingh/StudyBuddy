// import StudySummary from "../components/StudySummary";
// import NotesPanel from "../components/NotesPanel";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useEffect, useState } from "react";

// export default function Dashboard() {

//   const navigate = useNavigate();
//   const [activeSession, setActiveSession] = useState(false);

//   useEffect(() => {
//     api.get("/tracking/active/")
//       .then(res => setActiveSession(res.data.active))
//       .catch(() => {});
//   }, []);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-[#fff5f2] via-white to-[#fff1ec] px-6 py-10">

//       <div className="max-w-7xl mx-auto">

//         {/* HEADER */}
//         <div className="mb-12">
//           <h1 className="text-3xl font-semibold text-gray-800">
//             Dashboard
//           </h1>
//           <p className="text-sm text-gray-500 mt-2">
//             Track your progress. Stay consistent.
//           </p>
//         </div>

//         {/* GRID LAYOUT */}
//         <div className="grid lg:grid-cols-3 gap-10">

//           {/* LEFT SIDE */}
//           <div className="lg:col-span-2 space-y-10">

//             <StudySummary />

//             {/* ACTIVE SESSION */}
//             <div className="relative bg-white rounded-3xl p-10 shadow-lg border border-orange-100 overflow-hidden">

//               <div className="absolute -top-24 -right-24 w-80 h-80 bg-linear-to-br from-orange-400 to-red-500 opacity-10 rounded-full blur-3xl"></div>

//               <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">

//                 <div>
//                   <div className="inline-block px-3 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full mb-4">
//                     Focus Session
//                   </div>

//                   <h3 className="text-2xl font-semibold text-gray-800 mb-3">
//                     {activeSession
//                       ? "You're currently studying"
//                       : "Ready to start a focus session?"}
//                   </h3>

//                   <p className="text-gray-500 text-sm max-w-md">
//                     {activeSession
//                       ? "Continue your active study session and maintain your streak."
//                       : "Start a new session and build daily consistency."}
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => navigate("/dashboard/study/3")}
//                   className="px-8 py-4 rounded-2xl bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
//                 >
//                   {activeSession ? "Continue Session" : "Start Session"}
//                 </button>

//               </div>
//             </div>

//           </div>
//                   {/* <StudyTracker pdfId={pdfId} /> */}
        
//           {/* RIGHT SIDE - NOTES COMPONENT */}
//           <NotesPanel />

//         </div>

//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";

import StudySummary from "../components/StudySummary";
import FocusCard from "../components/FocusCard";
import PedagogicalCard from "../components/PedagogicalCard";
import NotesPanel from "../components/NotesPanel";
import AdaptiveStudyPlan from "../components/AdaptiveStudyPlan";
import ReviewQueueCard from "../components/ReviewQueueCard";
import TargetProgressCard from "../components/TargetProgressCard";


export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fff5f2] via-white to-[#fff1ec] px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* ===== HEADER ===== */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-800">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Understand your learning patterns. Improve steadily.
          </p>
        </div>

        {/* ===== GRID LAYOUT ===== */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-2 space-y-10">

            {/* SUMMARY (existing component) */}
            <StudySummary />

            <TargetProgressCard />

            <ReviewQueueCard />

            {/* AI FOCUS CARD */}
            <FocusCard />

            <PedagogicalCard />

            <AdaptiveStudyPlan />

            {/* RESUME LEARNING */}
            <div className="relative bg-white rounded-3xl p-10 shadow-lg border border-orange-100 overflow-hidden">

              {/* soft background glow */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-linear-to-br from-orange-400 to-red-500 opacity-10 rounded-full blur-3xl"></div>

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                <div>
                  <div className="inline-block px-3 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full mb-4">
                    Learning
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Continue learning
                  </h3>

                  <p className="text-gray-500 text-sm max-w-md">
                    Open your study materials and pick up where you left off.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/dashboard/pdfs")}
                  className="px-8 py-4 rounded-2xl bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                  Open PDFs
                </button>

              </div>
            </div>

          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <NotesPanel />

        </div>
      </div>
    </div>
  );
}
