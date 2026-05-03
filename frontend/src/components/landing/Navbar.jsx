import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { navItems } from "../../constants";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img className="h-10 w-10 rounded-xl shadow-sm" src={logo} alt="StudyBuddy" />
          <div className="leading-tight">
            <span className="block text-base font-semibold tracking-tight text-slate-950">
              StudyBuddy
            </span>
            <span className="block text-xs text-slate-500">Study with clarity</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] transition hover:bg-orange-500"
          >
            Start free
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileDrawerOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-700 lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileDrawerOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-5 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-5">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="flex-1 rounded-full bg-orange-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
