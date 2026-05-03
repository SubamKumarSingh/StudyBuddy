import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hasPassword, setHasPassword] = useState(user?.has_password ?? false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof user?.has_password === "boolean") {
      setHasPassword(user.has_password);
    } else {
      api.get("/accounts/password/")
        .then((res) => setHasPassword(res.data.has_password))
        .catch(() => {});
    }
  }, [user]);

  const title = useMemo(
    () => (hasPassword ? "Change password" : "Create password"),
    [hasPassword]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setSaving(false);
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/accounts/password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setHasPassword(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password saved successfully.");
    } catch (err) {
      setError(
        Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail.join(" ")
          : err.response?.data?.detail || "Unable to save password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-orange-100 bg-linear-to-r from-white to-orange-50 p-6 shadow-sm">
        <p className="text-sm font-medium text-orange-600">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
          Account preferences
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Manage the account details tied to your study progress, and add a password later if you originally signed in with Google.
        </p>
      </div>

      <SectionCard
        title="Account overview"
        description="This is the account currently connected to your study data and AI history."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
              Email
            </div>
            <div className="mt-2 text-sm font-medium text-gray-900">
              {user?.email || "Loading..."}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
              Password login
            </div>
            <div className="mt-2 text-sm font-medium text-gray-900">
              {hasPassword ? "Enabled" : "Not set yet"}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Quick start"
        description="Optional setup that helps the AI understand your goals. You can do this now, later, or skip it entirely."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm leading-6 text-gray-700">
            Tell us what you want to achieve in plain language, like "study 45
            minutes a day" or "finish my calculus notes by the end of the
            month." We’ll turn it into a pacing plan and keep adapting it with
            your study data.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/onboarding")}
              className="rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Set learning target
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Maybe later
            </button>
          </div>

          {!user?.has_active_target && (
            <p className="text-xs text-gray-500">
              You do not have an active target yet, so the app is using its
              general study signals for now.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={title}
        description={
          hasPassword
            ? "Update your password so you can keep using email/password login."
            : "Create a password now so you can log in later without Google."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {hasPassword && (
            <Field
              label="Current password"
              type="password"
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
          )}

          <Field
            label="New password"
            type="password"
            placeholder="Choose a strong password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete={hasPassword ? "new-password" : "new-password"}
          />

          <Field
            label="Confirm new password"
            type="password"
            placeholder="Repeat the password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          {message && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : title}
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
