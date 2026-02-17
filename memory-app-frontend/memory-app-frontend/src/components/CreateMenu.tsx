import envelopesIcon from "../assets/icons/envelopes.svg";
import legacyIcon from "../assets/icons/legacyenvos.svg";
import journalsIcon from "../assets/icons/journals.svg";
import lifeEventIcon from "../assets/icons/lifeevent.svg";
import groupsIcon from "../assets/icons/groups.svg";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (key: "group" | "envos" | "legacy" | "journal" | "lifeevent") => void;
};

export default function CreateMenu({ open, onClose, onPick }: Props) {
  if (!open) return null;

  const items: Array<{
    key: Props["onPick"] extends (k: infer K) => void ? K : never;
    label: string;
    icon: string;
  }> = [
    { key: "group", label: "group", icon: groupsIcon },
    { key: "envos", label: "envos", icon: envelopesIcon },
    { key: "legacy", label: "legacy envos", icon: legacyIcon },
    { key: "journal", label: "journal", icon: journalsIcon },
    { key: "lifeevent", label: "life event", icon: lifeEventIcon },
  ];

  return (
    <>
      {/* click outside to close */}
      <div onClick={onClose} style={styles.backdrop} />

      <div style={styles.menu}>
        <div style={styles.title}>create</div>
        <div style={styles.divider} />

        {items.map((it) => (
          <button
            key={it.key as any}
            type="button"
            style={styles.item}
            onClick={() => {
              onPick(it.key as any);
              onClose();
            }}
          >
            <img src={it.icon} alt="" style={styles.icon} />
            <span style={styles.label}>{it.label}</span>
          </button>
        ))}
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
    width: 260,
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
  item: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
  },
  icon: { width: 22, height: 22 },
  label: { fontWeight: 800, color: "#111827" },
};
