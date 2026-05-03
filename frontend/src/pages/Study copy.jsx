import { useParams, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

import StudyTracker from "../components/StudyTracker.jsx";
import NotesPanel from "../components/NotesPanel.jsx";
import AITutorChat from "../components/AITutorChat.jsx";
import { logEvent } from "../utils/eventLogger";


// MAIN 
export default function Study() {

  const { pdfId } = useParams();

  const startTimeRef = useRef(null);
  const lastScrollLog = useRef(0);

  const [loadError, setLoadError] = useState(false);
  const [checking, setChecking] = useState(true);
  if (!pdfId) {
    return <Navigate to="/dashboard/pdfs" replace />;
  }
  useEffect(() => {
  const checkAccess = async () => {
    try {
      await api.get(`/resources/pdfs/${pdfId}/check/`);
      setLoadError(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setLoadError(true);
      }
    } finally {
      setChecking(false);
    }
  };

  checkAccess();
}, [pdfId]);
  if (checking) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading PDF...
    </div>
  );
}
  const pdfUrl = `http://127.0.0.1:8000/api/resources/pdfs/${pdfId}/stream/`;


  const connectDrive = () => {

    const redirect = encodeURIComponent(
      `http://localhost:5173/dashboard/study/${pdfId}`
    );

    window.location.href =
      `http://127.0.0.1:8000/accounts/google/login/?process=connect&next=${redirect}`;

  };

  /* ===============================
     RESOURCE OPEN
  =============================== */

  const handlePdfLoad = async () => {

    if (startTimeRef.current) return;

    startTimeRef.current = Date.now();

    await logEvent({
      event_type: "RESOURCE_OPEN",
      resource_id: pdfId
    });

    try {
      await api.post(`/resources/pdfs/${pdfId}/open/`);
    } catch (err) {
      console.error("Failed to log PDF open", err);
    }

  };

  /* ===============================
     RESOURCE CLOSE
  =============================== */

  useEffect(() => {

    const handleClose = async () => {

      if (!startTimeRef.current) return;

      const duration =
        Math.floor((Date.now() - startTimeRef.current) / 1000);

      startTimeRef.current = null;

      await logEvent({
        event_type: "RESOURCE_CLOSE",
        resource_id: pdfId,
        duration: duration
      });

      try {
        await api.post(`/resources/pdfs/${pdfId}/close/`, { duration });
      } catch (err) {
        console.error("Failed to log PDF close", err);
      }

    };

    window.addEventListener("beforeunload", handleClose);

    return () => {

      handleClose();

      window.removeEventListener("beforeunload", handleClose);

    };

  }, [pdfId]);

  /* ===============================
     TAB VISIBILITY TRACKING
     (attention signal)
  =============================== */

  useEffect(() => {

    const handleVisibility = () => {

      if (document.hidden) {

        logEvent({
          event_type: "TAB_HIDDEN",
          resource_id: pdfId,
          tab_active: false
        });

      } else {

        logEvent({
          event_type: "TAB_VISIBLE",
          resource_id: pdfId,
          tab_active: true
        });

      }

    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

  }, [pdfId]);

  /* ===============================
     SCROLL DEPTH TRACKING
     (reading engagement signal)
  =============================== */

  useEffect(() => {

    const handleScroll = () => {

      const now = Date.now();

      /* throttle events */
      if (now - lastScrollLog.current < 2000) return;

      lastScrollLog.current = now;

      const scrollTop = window.scrollY;

      const height =
        document.body.scrollHeight - window.innerHeight;

      const depth = height > 0
        ? scrollTop / height
        : 0;

      logEvent({
        event_type: "SCROLL",
        resource_id: pdfId,
        scroll_depth: depth
      });

    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);

  }, [pdfId]);

  /* ===============================
     PAGE FOCUS SIGNAL
     =============================== */

  useEffect(() => {

    logEvent({
      event_type: "PAGE_VIEW",
      resource_id: pdfId
    });

  }, [pdfId]);

  /* ===============================
     ERROR SCREEN
  =============================== */

  if (loadError) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fff5f2] via-white to-[#fff1ec]">

        <div className="bg-white p-10 rounded-3xl shadow-lg border border-orange-100 text-center">

          <h2 className="text-xl font-semibold mb-4">
            Google Drive Required
          </h2>

          <p className="text-gray-500 mb-6">
            Connect your Google Drive to access this study material.
          </p>

          <button
            onClick={connectDrive}
            className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white font-medium shadow hover:shadow-lg transition"
          >
            Connect Google Drive
          </button>

        </div>

      </div>

    );

  }

  /* ===============================
     MAIN UI
  =============================== */

  return (

    <div className="min-h-screen bg-linear-to-br from-[#fff5f2] via-white to-[#fff1ec] p-6">

      <div className="h-[calc(100vh-3rem)] flex gap-8 max-w-400 mx-auto">

        {/* PDF VIEWER */}

        <div className="flex-1 relative bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden group">

          <div className="absolute -top-20 -right-20 w-72 h-72 bg-linear-to-br from-orange-400 to-red-500 opacity-5 rounded-full blur-3xl pointer-events-none"></div>

          <iframe
            src={pdfUrl}
            title="Study PDF"
            className="w-full h-full border-0"
            allow="fullscreen"
            onLoad={handlePdfLoad}
            // onError={() => setLoadError(true)}
          />

        </div>

        {/* SIDE PANEL */}

        {/* <div className="w-80 bg-white/70 backdrop-blur-xl rounded-3xl shadow-md border border-orange-100 p-6 sticky top-6 h-fit">

          <StudyTracker pdfId={pdfId} />

          <div className="mt-8">
            <NotesPanel />
          </div>

        </div> */}
        <div className="w-80 space-y-6">

  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-md border border-orange-100 p-6">

    <StudyTracker pdfId={pdfId} />

  </div>

  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-md border border-orange-100 p-6">

    <NotesPanel />

  </div>

  <AITutorChat pdfId={pdfId} />

</div>
      </div>

    </div>

  );

}