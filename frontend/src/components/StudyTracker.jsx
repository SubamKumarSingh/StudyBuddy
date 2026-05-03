import { useEffect, useState } from "react";
import api from "../api/axios";
import { useIdleTimer } from "react-idle-timer";
import { Pause, Play, Square, Timer } from "lucide-react";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f8faf7] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function StudyTracker() {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    api.get("/tracking/active/").then((res) => {
      if (res.data.active) {
        setSessionId(res.data.session_id);
        setStatus(res.data.status);
        setStartTime(new Date(res.data.started_at));
      }
    });
  }, []);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (!sessionId) return;

    const hb = setInterval(() => {
      api.post(`/tracking/heartbeat/${sessionId}/`);
    }, 60000);

    return () => clearInterval(hb);
  }, [sessionId]);

  useIdleTimer({
    timeout: 5 * 60 * 1000,
    onIdle: () => sessionId && api.post(`/tracking/idle-start/${sessionId}/`),
    onActive: () => sessionId && api.post(`/tracking/idle-end/${sessionId}/`),
  });

  const start = async () => {
    const res = await api.post("/tracking/start/");
    setSessionId(res.data.session_id);
    setStartTime(new Date());
    setStatus("ACTIVE");
  };

  const pause = async () => {
    await api.post(`/tracking/pause/${sessionId}/`);
    setStatus("PAUSED");
  };

  const resume = async () => {
    await api.post(`/tracking/resume/${sessionId}/`);
    setStatus("ACTIVE");
  };

  const end = async () => {
    await api.post(`/tracking/end/${sessionId}/`);
    const analytics = await api.get(`/tracking/analytics/${sessionId}/`);
    alert(`Effective study time: ${analytics.data.effective_seconds} seconds`);

    setSessionId(null);
    setStartTime(null);
    setElapsed(0);
    setStatus(null);
  };

  const formatTime = () => {
    const totalSeconds = Math.floor(elapsed / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const statusTone = {
    ACTIVE: "border-emerald-100 bg-emerald-50 text-emerald-700",
    PAUSED: "border-amber-100 bg-amber-50 text-amber-700",
    IDLE: "border-orange-100 bg-orange-50 text-orange-700",
  };

  const statusLabel = status || "Ready";

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-600">Session Tracker</p>
          </div>
          <div className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone[status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
            {statusLabel}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[1.5rem] border border-slate-100 bg-[#f8faf7] px-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
            <Timer size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Elapsed</p>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatTime()}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="State" value={statusLabel} />
          <Stat label="Session" value={sessionId ? "Active" : "Idle"} />
          <Stat label="Flow" value={startTime ? "Running" : "Waiting"} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {!sessionId && (
          <button
            onClick={start}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(249,115,22,0.24)] transition hover:bg-orange-500"
          >
            <Play size={16} />
            Start session
          </button>
        )}

        {status === "ACTIVE" && (
          <button
            onClick={pause}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-700"
          >
            <Pause size={16} />
            Pause
          </button>
        )}

        {(status === "PAUSED" || status === "IDLE") && (
          <button
            onClick={resume}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            <Play size={16} />
            Resume
          </button>
        )}

        {sessionId && (
          <button
            onClick={end}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Square size={16} />
            End session
          </button>
        )}
      </div>
    </div>
  );
}
