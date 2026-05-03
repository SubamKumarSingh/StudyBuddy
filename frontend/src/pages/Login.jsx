import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Field({ label, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Unable to sign in. Check your email and password."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");
      setBusy(true);

      const res = await api.post("/accounts/google/", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      console.error("Google login error", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-orange-600">Welcome back</p>
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          Sign in to StudyBuddy
        </h2>
        <p className="text-sm leading-6 text-gray-600">
          Use Google for the fastest sign-in, or continue with your email and password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          <GoogleLogin
            theme="outline"
            size="large"
            text="signin_with"
            shape="pill"
            width="100%"
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google sign-in failed. Please try again.")}
          />
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          <span>or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Field
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200/50 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="space-y-3 text-center">
        <p className="text-sm text-gray-600">
          New here?{" "}
          <Link className="font-semibold text-orange-600 hover:text-orange-700" to="/signup">
            Create an account
          </Link>
        </p>

        <p className="text-sm text-gray-500">
          Having trouble? Try Google sign-in first, then email/password if needed.
        </p>
      </div>
    </div>
  );
}
