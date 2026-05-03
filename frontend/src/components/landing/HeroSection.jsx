import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, Sparkles, TimerReset } from "lucide-react";
import Threads from "./Threads";

const statCards = [
  { label: "Focus score", value: "92%", tone: "from-orange-500 to-amber-500" },
  { label: "Active minutes", value: "3h 42m", tone: "from-slate-900 to-slate-700" },
  { label: "Next action", value: "Revise", tone: "from-orange-600 to-orange-400" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/70 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-8 lg:px-10 lg:py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.16),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-72 opacity-70">
        <Threads amplitude={0.85} distance={0.2} enableMouseInteraction />
      </div>

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div className="max-w-2xl">
          {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm">
            <Sparkles size={16} />
            Built for focused learners
          </div> */}

          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Study smarter.
            <span className="block bg-linear-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Stay in flow.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            StudyBuddy turns sessions into a polished, AI-guided workflow with clear focus scores,
            smarter next steps, and a cleaner way to study from PDFs without losing momentum.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(249,115,22,0.28)] transition hover:bg-orange-500"
            >
              Start free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
            >
              Explore features
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Session tracking", "AI insights", "PDF workspace"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-4xl bg-gradient-to-br from-orange-200/50 via-white/0 to-amber-200/50 blur-3xl" />
          <div className="rounded-[2rem] border border-white/70 bg-slate-950/95 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-300">Today</p>
                  <h2 className="mt-2 text-xl font-semibold">Your study cockpit</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-orange-200">
                  Live
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {statCards.map((card) => (
                  <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.tone} p-[1px]`}>
                    <div className="h-full rounded-2xl bg-slate-950/95 p-4">
                      <p className="text-xs text-slate-300">{card.label}</p>
                      <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <BookOpenText className="text-orange-300" size={18} />
                    <p className="text-sm font-medium text-slate-200">PDF focus mode</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Read notes, track attention, and keep the next action visible without jumping
                    between tools.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <TimerReset className="text-orange-300" size={18} />
                    <p className="text-sm font-medium text-slate-200">Focus cycle</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Work in clean blocks, review the signal, and keep your momentum visible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
