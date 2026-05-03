import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import api from "../api/axios";

export default function Signup() {
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const res = await api.post("/accounts/google/", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google signup failed", err);
      alert("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-orange-600">Get started</p>
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          Create your StudyBuddy account
        </h2>
        <p className="text-sm leading-6 text-gray-600">
          Create an account with Google and start studying right away.
        </p>
      </div>

      <div className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5">
        <GoogleLogin
          theme="outline"
          size="large"
          text="signup_with"
          shape="pill"
          width="100%"
          onSuccess={handleGoogleSignup}
          onError={() => alert("Google sign-up failed. Please try again.")}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-600">
        This account is used across your PDFs, analytics, AI tutor, and study plan.
      </div>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link className="font-semibold text-orange-600 hover:text-orange-700" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
