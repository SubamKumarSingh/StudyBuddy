const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const resolvedFrontendBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_APP_BASE_URL || window.location.origin
);

export const frontendBaseUrl = resolvedFrontendBaseUrl;
export const backendBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_BASE_URL || "http://127.0.0.1:8000"
);
export const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || `${backendBaseUrl}/api`
);
