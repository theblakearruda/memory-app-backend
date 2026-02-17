type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationsMenu({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={styles.backdrop} />

      <div style={styles.menu}>
        <div style={styles.title}>notifications</div>
        <div style={styles.divider} />

        <div style={styles.emptyWrap}>
          <div style={styles.emptyTitle}>nothing to see here</div>
          <div style={styles.emptySub}>no new notifications.</div>
        </div>
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
    right: 52, // nudges it left so it sits under the bell
    width: 320,
    background: "white",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
    padding: 12,
    zIndex: 70,
  },
  title: {
    fontWeight: 900,
    fontSize: 14,
    color: "#111827",
    padding: "2px 4px",
    textAlign: "left",
  },
  divider: {
    height: 1,
    background: "rgba(0,0,0,0.08)",
    margin: "8px 0",
  },
  emptyWrap: {
    padding: 14,
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid rgba(0,0,0,0.06)",
    textAlign: "left",
  },
  emptyTitle: { fontWeight: 900, color: "#111827" },
  emptySub: { marginTop: 4, fontWeight: 700, color: "rgba(0,0,0,0.60)", fontSize: 13 },
};