import { useMemo } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

// read name from the *real* saved user (localStorage), fall back to old sessionStorage if needed
function readProfile() {
  // newest keys (what you should be using)
  const tryKeys = ["MyLyfe_user", "mylyfe_user", "mylife_user"];

  for (const k of tryKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const j = JSON.parse(raw);
      const first = String(j?.first ?? "").trim();
      const last = String(j?.last ?? "").trim();
      const name = [first, last].filter(Boolean).join(" ").trim();
      const initial = (first?.[0] || last?.[0] || "🙂").toUpperCase();
      if (name) return { name, initial };
    } catch {
      // ignore
    }
  }

  // legacy fallback (older code you had)
  try {
    const raw = sessionStorage.getItem("mylyfe_signup");
    const j = raw ? JSON.parse(raw) : {};
    const first = String(j?.first ?? "").trim();
    const last = String(j?.last ?? "").trim();
    const name = [first, last].filter(Boolean).join(" ").trim();
    const initial = (first?.[0] || last?.[0] || "🙂").toUpperCase();
    return { name: name || "mylyfe user", initial };
  } catch {
    return { name: "mylyfe user", initial: "🙂" };
  }
}

export default function AccountMenu({ open, onClose, onLogout }: Props) {
  if (!open) return null;

  const profile = useMemo(() => readProfile(), []);

  const Row = ({
    icon,
    label,
    danger,
    onClick,
  }: {
    icon: string;
    label: string;
    danger?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.row,
        color: danger ? "#b91c1c" : "#111827",
      }}
    >
      <span style={styles.rowIcon}>{icon}</span>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.chev}>›</span>
    </button>
  );

  return (
    <>
      <div onClick={onClose} style={styles.backdrop} />

      <div style={styles.menu}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>{profile.initial}</div>
          <div style={styles.profileName}>{profile.name}</div>
          <button type="button" style={styles.profileBtn}>
            see all profiles
          </button>
        </div>

        <div style={styles.list}>
          <Row icon="⚙️" label="settings & privacy" />
          <Row icon="❓" label="help & support" />
          <Row icon="🌙" label="display & accessibility" />
          <Row icon="💬" label="give feedback" />
          <Row
            icon="⎋"
            label="log out"
            danger
            onClick={() => {
              onClose();
              onLogout();
            }}
          />
        </div>

        <div style={styles.footer}>privacy · terms · cookies · more</div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "transparent",
    zIndex: 60,
  },
  menu: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 330,
    background: "white",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
    padding: 12,
    zIndex: 70,
  },

  profileCard: {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    padding: 12,
    display: "grid",
    gap: 8,
    background: "#ffffff",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "#e5e7eb",
    border: "1px solid rgba(0,0,0,0.10)",
    display: "grid",
    placeItems: "center",
    fontWeight: 1000,
    color: "#111827",
  },
  profileName: { fontWeight: 1000, color: "#111827" },
  profileBtn: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "#e5e7eb",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  },

  list: { marginTop: 10, display: "grid", gap: 6 },
  row: {
    width: "100%",
    border: "none",
    background: "#f3f4f6",
    borderRadius: 12,
    padding: "10px 12px",
    display: "grid",
    gridTemplateColumns: "28px 1fr 18px",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "left",
  },
  rowIcon: { fontSize: 16 },
  rowLabel: { fontWeight: 900 },
  chev: { opacity: 0.6, fontWeight: 1000, textAlign: "right" },

  footer: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(0,0,0,0.55)",
    paddingLeft: 4,
  },
};
