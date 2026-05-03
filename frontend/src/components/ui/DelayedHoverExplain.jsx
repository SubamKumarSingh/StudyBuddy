import { useEffect, useRef, useState } from "react";

const cornerStyles = {
  "top-right": "top-4 right-4 origin-top-right",
  "top-left": "top-4 left-4 origin-top-left",
  "bottom-right": "bottom-4 right-4 origin-bottom-right",
  "bottom-left": "bottom-4 left-4 origin-bottom-left",
};

export default function DelayedHoverExplain({
  children,
  title,
  body,
  detailRows = [],
  className = "",
  overlayClassName = "",
  delay = 550,
}) {
  const [open, setOpen] = useState(false);
  const [corner, setCorner] = useState("top-right");
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const handleEnter = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), delay);
  };

  const handleMove = (event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const isLeft = event.clientX < rect.left + rect.width / 2;
    const isTop = event.clientY < rect.top + rect.height / 2;

    if (isTop && isLeft) setCorner("bottom-right");
    else if (isTop && !isLeft) setCorner("bottom-left");
    else if (!isTop && isLeft) setCorner("top-right");
    else setCorner("top-left");
  };

  const handleLeave = () => {
    window.clearTimeout(timerRef.current);
    setOpen(false);
  };

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children(open)}

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute z-30 w-72 rounded-3xl border border-orange-200 bg-white/95 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 ${
          cornerStyles[corner]
        } ${
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        } ${overlayClassName}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-600">
          What this card does
        </p>
        <h4 className="mt-2 text-sm font-semibold text-slate-950">{title}</h4>
        <p className="mt-2 text-xs leading-6 text-slate-600">{body}</p>

        {!!detailRows.length && (
          <div className="mt-4 space-y-3 rounded-2xl bg-orange-50/70 p-3">
            {detailRows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 text-xs">
                <span className="font-medium text-slate-500">{row.label}</span>
                <span className="text-right font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
