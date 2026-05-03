import { features } from "../../constants";

const FeatureSection = () => {
  return (
    <section id="features" className="pb-20 pt-8 lg:pb-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">
          Features
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
          Everything feels lighter when the product is doing the thinking for you.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          The landing page should read like a real product: one clear promise, a few credible
          capabilities, and a clean path into the app.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.text}
            className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              {feature.icon}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.text}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
