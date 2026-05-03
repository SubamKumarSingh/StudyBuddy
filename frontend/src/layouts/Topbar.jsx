import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: "56px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#ffffff",
      }}
    >
      <span style={{ fontSize: "14px", color: "#6b7280" }}>
        Welcome{user?.email ? `, ${user.email}` : ""}
      </span>

      <button
        onClick={logout}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </header>
  );
}
