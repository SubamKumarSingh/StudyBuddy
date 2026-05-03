import { BarChart3, ChevronRight, Compass, Layers3 } from "lucide-react";
import { checklistItems } from "../../constants";

const steps = [
  {
    icon: Compass,
    title: "Capture your session",
    summary: "Start a focused block, set the subject, and keep the workflow simple.",
  },
  {
    icon: BarChart3,
    title: "See the signal",
    summary: "StudyBuddy surfaces focus patterns, time loss, and progress in one view.",
  },
  {
    icon: Layers3,
    title: "Move faster next time",
    summary: "Use the recommendation and your history to make the next block sharper.",
  },
];

const Workflow = () => {
  return (
    <section id="how-it-works" className="grid gap-10 pb-20 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:pb-28">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">
          How it works
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
          A cleaner study flow from the first timer tap to the last insight.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          The page only needs to show a believable path: start, measure, improve. That keeps the
          experience sharp and makes the product feel real.
        </p>

        <div className="mt-8 space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          {checklistItems.map((item, index) => (
            <div key={item.title} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="results" className="grid gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                    <ChevronRight className="text-slate-300" size={18} />
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{step.summary}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Workflow;
