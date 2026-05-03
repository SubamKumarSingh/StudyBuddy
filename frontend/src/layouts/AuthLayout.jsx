import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#fff7f2] via-white to-[#fff1ec] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-2xl shadow-orange-100/60 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="relative hidden overflow-hidden bg-linear-to-br from-orange-500 via-orange-600 to-red-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_28%)]" />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <img src={logo} alt="StudyBuddy" className="h-12 w-12 rounded-2xl bg-white/15 p-2 backdrop-blur" />
              <div>
                <div className="text-2xl font-semibold tracking-tight">StudyBuddy</div>
                <div className="text-sm text-orange-50/90">Adaptive learning that feels personal</div>
              </div>
            </div>

            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
              One place to log in, study, and stay on track.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-orange-50/90">
              Connect with Google or use email login to pick up exactly where you left off in your study flow.
            </p>
          </div>

          <div className="relative space-y-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm font-medium text-orange-50">Built for focused study</div>
              <div className="mt-1 text-sm text-orange-50/90">
                PDFs, AI tutor, analytics, and session tracking are all tied into the same account.
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-orange-50/80">Fast</div>
                <div className="mt-1 font-semibold">Quick sign-in</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-orange-50/80">Safe</div>
                <div className="mt-1 font-semibold">JWT auth</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-orange-50/80">Smart</div>
                <div className="mt-1 font-semibold">Personalized flow</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white p-8 md:p-10 lg:p-12">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
