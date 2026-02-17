import { useEffect, useState } from "react";
import Splash from "../pages/Splash";

export default function BootSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "white",
      }}
    >
      <Splash />
    </div>
  );
}