import { Link } from "react-router-dom";
import { resourcesLinks, platformLinks, communityLinks } from "../../constants";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 pt-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">
              StudyBuddy
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              A study product that feels built, not assembled.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Keep the same warm tone, remove the noise, and make the page feel like something
              people would actually sign up for.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)]"
            >
              Start free
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.text}>
                  <a className="text-sm text-slate-600 transition hover:text-orange-700" href={link.href}>
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.text}>
                  <a className="text-sm text-slate-600 transition hover:text-orange-700" href={link.href}>
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Community
            </h3>
            <ul className="mt-4 space-y-3">
              {communityLinks.map((link) => (
                <li key={link.text}>
                  <a className="text-sm text-slate-600 transition hover:text-orange-700" href={link.href}>
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
