import { useParams, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { BotMessageSquare, Timer } from "lucide-react";

import StudyTracker from "../components/StudyTracker.jsx";
import NotesPanel from "../components/NotesPanel.jsx";
import AITutorChat from "../components/AITutorChat.jsx";
import { backendBaseUrl, frontendBaseUrl } from "../config";
import { logEvent } from "../utils/eventLogger";

const pageBg =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.11),_transparent_30%),linear-gradient(180deg,_#fffaf4_0%,_#fff_42%,_#fff8f1_100%)]";

function LoadingState({ message }) {
  return (
    <div className={pageBg}>
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="max-w-sm rounded-[2rem] border border-white/70 bg-white/85 px-7 py-6 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          {message}
        </div>
      </div>
    </div>
  );
}

export default function Study() {
  const { pdfId } = useParams();

  const startTimeRef = useRef(null);
  const lastScrollLog = useRef(0);
  const pdfObjectUrlRef = useRef(null);

  const [loadError, setLoadError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfSrc, setPdfSrc] = useState(null);
  const [activeTool, setActiveTool] = useState(null);

  const connectDrive = () => {
    const redirect = encodeURIComponent(`${frontendBaseUrl}/dashboard/study/${pdfId}`);
    window.location.href =
      `${backendBaseUrl}/accounts/google/login/?process=connect&next=${redirect}`;
  };

  useEffect(() => {
    if (!pdfId) return;

    const checkAccess = async () => {
      try {
        await api.get(`/resources/pdfs/${pdfId}/check/`);
        setLoadError(false);
      } catch (err) {
        const error = err.response?.data?.error;

        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          error === "GOOGLE_DRIVE_SESSION_EXPIRED"
        ) {
          setLoadError(true);
        }
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [pdfId]);

  useEffect(() => {
    if (!pdfId || loadError) return;

    const loadPdf = async () => {
      setLoadingPdf(true);

      try {
        const response = await api.get(`/resources/pdfs/${pdfId}/stream/`, {
          responseType: "blob",
        });

        if (pdfObjectUrlRef.current) {
          URL.revokeObjectURL(pdfObjectUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(response.data);
        pdfObjectUrlRef.current = objectUrl;
        setPdfSrc(objectUrl);
      } catch (err) {
        const status = err.response?.status;
        const error = err.response?.data?.error;

        if (
          status === 401 ||
          status === 403 ||
          error === "GOOGLE_DRIVE_SESSION_EXPIRED" ||
          error === "GOOGLE_DRIVE_NOT_CONNECTED"
        ) {
          setLoadError(true);
        } else {
          console.error("Failed to load PDF", err);
        }
      } finally {
        setLoadingPdf(false);
      }
    };

    loadPdf();

    return () => {
      if (pdfObjectUrlRef.current) {
        URL.revokeObjectURL(pdfObjectUrlRef.current);
        pdfObjectUrlRef.current = null;
      }
    };
  }, [pdfId, loadError]);

  const handlePdfLoad = async () => {
    if (startTimeRef.current) return;

    startTimeRef.current = Date.now();

    await logEvent({
      event_type: "RESOURCE_OPEN",
      resource_id: pdfId,
    });

    try {
      await api.post(`/resources/pdfs/${pdfId}/open/`);
    } catch (err) {
      console.error("Failed to log PDF open", err);
    }
  };

  useEffect(() => {
    if (!pdfId) return;

    const handleClose = async () => {
      if (!startTimeRef.current) return;

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;

      await logEvent({
        event_type: "RESOURCE_CLOSE",
        resource_id: pdfId,
        duration,
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

  useEffect(() => {
    if (!pdfId) return;

    const handleVisibility = () => {
      logEvent({
        event_type: document.hidden ? "TAB_HIDDEN" : "TAB_VISIBLE",
        resource_id: pdfId,
        tab_active: !document.hidden,
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [pdfId]);

  useEffect(() => {
    if (!pdfId) return;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollLog.current < 2000) return;
      lastScrollLog.current = now;

      const scrollTop = window.scrollY;
      const height = document.body.scrollHeight - window.innerHeight;
      const depth = height > 0 ? scrollTop / height : 0;

      logEvent({
        event_type: "SCROLL",
        resource_id: pdfId,
        scroll_depth: depth,
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pdfId]);

  useEffect(() => {
    if (!pdfId) return;

    logEvent({
      event_type: "PAGE_VIEW",
      resource_id: pdfId,
    });
  }, [pdfId]);

  if (!pdfId) {
    return <Navigate to="/dashboard/pdfs" replace />;
  }

  if (checking) {
    return <LoadingState message="Loading your study material..." />;
  }

  if (loadError) {
    return (
      <div className={pageBg}>
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/85 px-8 py-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-slate-950">Connect Drive required</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Connect Drive to open this study material and continue your session in the workspace.
            </p>
            <button
              onClick={connectDrive}
              className="mt-6 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(249,115,22,0.24)] transition hover:bg-orange-500"
            >
              Connect Drive
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPdf || !pdfSrc) {
    return <LoadingState message="Loading your study material..." />;
  }

  const toolButtonClass =
    "inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:text-slate-950 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]";
  const toolPanelClass =
    "rounded-[1.75rem] border border-white/70 bg-white/90 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl";

  return (
    <div className={pageBg}>
      <div className="mx-auto max-w-[1720px] px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_390px] 2xl:grid-cols-[minmax(0,1.15fr)_420px]">
          <section className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_26px_90px_rgba(15,23,42,0.08)]">
              <iframe
                src={pdfSrc}
                title="Study PDF"
                className="h-[calc(100vh-1rem)] w-full border-0 sm:h-[calc(100vh-1.5rem)] lg:h-[calc(100vh-2rem)]"
                allow="fullscreen"
                onLoad={handlePdfLoad}
              />
            </div>
          </section>

          <aside className="flex min-h-[calc(100vh-1rem)] flex-col gap-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTool((current) => (current === "tracker" ? null : "tracker"))
                  }
                  className={`${toolButtonClass} ${activeTool === "tracker" ? "bg-orange-50 text-orange-600 ring-2 ring-orange-200" : ""}`}
                  aria-label="Toggle study tracker"
                  aria-pressed={activeTool === "tracker"}
                >
                  <Timer className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool((current) => (current === "tutor" ? null : "tutor"))}
                  className={`${toolButtonClass} ${activeTool === "tutor" ? "bg-orange-50 text-orange-600 ring-2 ring-orange-200" : ""}`}
                  aria-label="Toggle AI tutor"
                  aria-pressed={activeTool === "tutor"}
                >
                  <BotMessageSquare className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">Study tools</p>
                  <p className="text-xs text-slate-500">Open tracker or tutor when needed.</p>
                </div>
              </div>
            </div>

            {activeTool === "tracker" ? (
              <div className={toolPanelClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Study tracker</p>
                    <p className="text-xs text-slate-500">Session timing and focus rhythm.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
                <StudyTracker pdfId={pdfId} />
              </div>
            ) : null}

            {activeTool === "tutor" ? (
              <div className={toolPanelClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">AI tutor</p>
                    <p className="text-xs text-slate-500">Ask for explanations and quick help.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
                <AITutorChat pdfId={pdfId} />
              </div>
            ) : null}

            <div className="mt-auto rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <NotesPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
