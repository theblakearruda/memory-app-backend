import { NavLink } from "react-router-dom";

export default function Nav() {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    color: "white",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.18)",
    background: isActive ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
        padding: 14,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.05)"
      }}
    >
      <div style={{ fontWeight: 900, letterSpacing: 0.5 }}>MyLyfe</div>

      <div style={{ display: "flex", gap: 10 }}>
        <NavLink to="/" style={linkStyle} end>
          home
        </NavLink>
        <NavLink to="/create" style={linkStyle}>
          create
        </NavLink>
      </div>
    </div>
  );
}