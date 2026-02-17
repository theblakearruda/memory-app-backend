import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import friendsIcon from "../assets/icons/friends.svg";
import groupsIcon from "../assets/icons/groups.svg";
import videosIcon from "../assets/icons/videos.svg";
import feedsIcon from "../assets/icons/feeds.svg";
import envelopesIcon from "../assets/icons/envelopes.svg";
import journalsIcon from "../assets/icons/journals.svg";
import savedIcon from "../assets/icons/saved.svg";

type NavItem = {
  label: string;
  icon: string;
  path: string;
};

function readUserName() {
  // newest key
  try {
    const raw = localStorage.getItem("MyLyfe_user");
    if (raw) {
      const j = JSON.parse(raw);
      const first = String(j?.first ?? "").trim();
      const last = String(j?.last ?? "").trim();
      const full = [first, last].filter(Boolean).join(" ").trim();
      if (full) return full;
    }
  } catch {
    // ignore
  }

  // fallback (older experiments)
  try {
    const raw = localStorage.getItem("mylyfe_user") || localStorage.getItem("mylife_user");
    if (raw) {
      const j = JSON.parse(raw);
      const first = String(j?.first ?? "").trim();
      const last = String(j?.last ?? "").trim();
      const full = [first, last].filter(Boolean).join(" ").trim();
      if (full) return full;
    }
  } catch {
    // ignore
  }

  return "mylyfe user";
}

export default function Sidebar() {
  const nav = useNavigate();
  const location = useLocation();

  const name = useMemo(() => readUserName(), []);

  const items: NavItem[] = [
    { label: "friends", icon: friendsIcon, path: "/friends" },
    { label: "envos", icon: envelopesIcon, path: "/envos" },
    { label: "journals", icon: journalsIcon, path: "/journals" },
    { label: "saved", icon: savedIcon, path: "/saved" },
    { label: "groups", icon: groupsIcon, path: "/groups" },
    { label: "video", icon: videosIcon, path: "/video" },
    { label: "feeds", icon: feedsIcon, path: "/home" }, // home feed
  ];

  const activePath = location.pathname;

  return (
    <div style={styles.wrap}>
      <button
        type="button"
        style={styles.profile}
        onClick={() => nav("/home")}
        title="home"
      >
        <div style={styles.pfp}>👤</div>
        <div style={styles.name}>{name}</div>
      </button>

      <div style={styles.list}>
        {items.map((it) => {
          const active =
            activePath === it.path ||
            (it.path === "/home" && activePath === "/home");

          return (
            <button
              key={it.label}
              type="button"
              onClick={() => nav(it.path)}
              style={{
                ...styles.item,
                ...(active ? styles.itemActive : {}),
              }}
            >
              <img src={it.icon} alt="" style={styles.icon} />
              <span style={styles.text}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    width: 280,
    padding: 12,
    boxSizing: "border-box",
    position: "sticky",
    top: 70,
    height: "calc(100vh - 70px)",
    overflow: "auto",
  },
  profile: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  pfp: {
    width: 42,
    height: 42,
    borderRadius: 999,
    background: "#e5e7eb",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },
  name: {
    fontWeight: 900,
    color: "#111827",
    textTransform: "lowercase",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  item: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 12,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
  },
  itemActive: {
    background: "rgba(24,119,242,0.10)",
    outline: "2px solid rgba(24,119,242,0.18)",
  },
  icon: {
    width: 22,
    height: 22,
    objectFit: "contain",
  },
  text: {
    fontWeight: 800,
    color: "#111827",
    textTransform: "lowercase",
  },
};
