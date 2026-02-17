import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import CreateMenu from "./CreateMenu";
import NotificationsMenu from "./NotificationsMenu";
import AccountMenu from "./AccountMenu";

import feedsIcon from "../assets/icons/feeds.svg";
import friendsIcon from "../assets/icons/friends.svg";
import groupsIcon from "../assets/icons/groups.svg";

export default function TopBar() {
  const nav = useNavigate();
  const location = useLocation();

  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const [criteria, setCriteria] = useState("all");

  function closeAll() {
    setCreateOpen(false);
    setNotifOpen(false);
    setAcctOpen(false);
  }

  function logout() {
    // wipe EVERYTHING so you can't get "ghost authed"
    const keys = [
      "MyLyfe_user",
      "mylyfe_user",
      "mylife_user",
      "MyLyfe_authed",
      "mylyfe_authed",
      "mylife_authed",
      "MyLyfe_signup",
      "mylyfe_signup",
      "mylife_signup",
      "MyLyfe_onboarded",
      "mylyfe_onboarded",
      "mylife_onboarded",
    ];

    keys.forEach((k) => localStorage.removeItem(k));
    keys.forEach((k) => sessionStorage.removeItem(k));

    closeAll();
    nav("/signup", { replace: true });
  }

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <div style={styles.shell}>
      <div style={styles.left}>
        <div
          style={styles.logo}
          onClick={() => {
            closeAll();
            nav("/home");
          }}
          title="home"
        >
          MyLyfe
        </div>

        <div style={styles.searchWrap}>
          <div style={styles.searchIcon}>🔍</div>

          <input style={styles.search} placeholder="search…" spellCheck={false} />

          <select
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            style={styles.criteria}
          >
            <option value="all">all</option>
            <option value="people">people</option>
            <option value="envos">envos</option>
            <option value="journals">journals</option>
            <option value="places">places</option>
          </select>
        </div>
      </div>

      <div style={styles.center}>
        <button
          type="button"
          style={{ ...styles.navBtn, ...(isActive("/home") ? styles.navBtnActive : {}) }}
          onClick={() => {
            closeAll();
            nav("/home");
          }}
          title="home"
          aria-label="home"
        >
          <img src={feedsIcon} alt="home" style={styles.navIcon} />
        </button>

        <button
          type="button"
          style={{ ...styles.navBtn, ...(isActive("/friends") ? styles.navBtnActive : {}) }}
          onClick={() => {
            closeAll();
            nav("/friends");
          }}
          title="friends"
          aria-label="friends"
        >
          <img src={friendsIcon} alt="friends" style={styles.navIcon} />
        </button>

        <button
          type="button"
          style={{ ...styles.navBtn, ...(isActive("/groups") ? styles.navBtnActive : {}) }}
          onClick={() => {
            closeAll();
            nav("/groups");
          }}
          title="groups"
          aria-label="groups"
        >
          <img src={groupsIcon} alt="groups" style={styles.navIcon} />
        </button>
      </div>

      <div style={styles.right}>
        <div style={{ position: "relative" }}>
          <button
            style={styles.circleBtn}
            onClick={() => {
              setCreateOpen((v) => !v);
              setNotifOpen(false);
              setAcctOpen(false);
            }}
            aria-label="create"
            title="create"
          >
            ⬛⬛⬛
          </button>

          <CreateMenu
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onPick={(key) => {
              closeAll();
              if (key === "envos") nav("/create/envo");
              if (key === "legacy") nav("/legacy-create");
              if (key === "group") nav("/create/group");
              if (key === "journal") nav("/create/journal");
              if (key === "lifeevent") nav("/create/lifeevent");
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            style={styles.circleBtn}
            aria-label="notifications"
            title="notifications"
            onClick={() => {
              setNotifOpen((v) => !v);
              setCreateOpen(false);
              setAcctOpen(false);
            }}
          >
            🔔
            <span style={styles.badge}>2</span>
          </button>

          <NotificationsMenu open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div style={{ position: "relative" }}>
          <button
            style={styles.avatarBtn}
            aria-label="account"
            title="account"
            onClick={() => {
              setAcctOpen((v) => !v);
              setCreateOpen(false);
              setNotifOpen(false);
            }}
          >
            <div style={styles.avatar}>🙂</div>
          </button>

          <AccountMenu open={acctOpen} onClose={() => setAcctOpen(false)} onLogout={logout} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 58,
    background: "white",
    borderBottom: "1px solid rgba(0,0,0,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    zIndex: 40,
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 360,
  },
  logo: {
    fontWeight: 900,
    fontSize: 22,
    color: "#1a7f2e",
    letterSpacing: 0.5,
    cursor: "pointer",
    userSelect: "none",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f0f2f5",
    borderRadius: 999,
    padding: "8px 10px",
    border: "1px solid rgba(0,0,0,0.08)",
    width: 340,
    boxSizing: "border-box",
  },
  searchIcon: { opacity: 0.7 },
  search: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#111827",
  },
  criteria: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontWeight: 800,
    color: "#111827",
    cursor: "pointer",
  },

  center: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    flex: 1,
  },
  navBtn: {
    width: 52,
    height: 40,
    borderRadius: 12,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  navBtnActive: {
    background: "rgba(24,119,242,0.10)",
    outline: "2px solid rgba(24,119,242,0.18)",
  },
  navIcon: {
    width: 22,
    height: 22,
    objectFit: "contain",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 220,
    justifyContent: "flex-end",
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#f0f2f5",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    position: "relative",
    fontSize: 14,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#e11d48",
    color: "white",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    padding: "3px 6px",
    border: "2px solid white",
  },
  avatarBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    background: "#e5e7eb",
    border: "1px solid rgba(0,0,0,0.10)",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },
};
