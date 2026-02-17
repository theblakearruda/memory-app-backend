import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import proposalImg from "../assets/onboarding/proposal.svg";
import babyImg from "../assets/onboarding/thebaby.svg";
import retirementImg from "../assets/onboarding/theretirement.svg";

const STORAGE_AUTH = "MyLyfe_authed";

export default function Splash() {
  const nav = useNavigate();

  const slides = useMemo(
    () => [
      { img: proposalImg, alt: "proposal" },
      { img: babyImg, alt: "baby" },
      { img: retirementImg, alt: "retirement" },
    ],
    []
  );

  const SLIDE_MS = 1800;
  const FADE_MS = 350;

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const startedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    // guard: don’t start the loop twice
    if (startedRef.current) return;
    startedRef.current = true;

    let alive = true;

    const step = () => {
      if (!alive) return;

      // start fade out
      setVisible(false);

      // after fade, advance slide
      fadeRef.current = window.setTimeout(() => {
        if (!alive) return;

        setIdx((prev) => {
          const next = prev + 1;

          // finished slideshow
          if (next >= slides.length) {
            const authed = localStorage.getItem(STORAGE_AUTH) === "1";
            nav(authed ? "/home" : "/signup", { replace: true });
            return prev; // keep last frame while navigating
          }

          return next;
        });

        // fade in new slide
        setVisible(true);

        // schedule next step
        timerRef.current = window.setTimeout(step, SLIDE_MS);
      }, FADE_MS);
    };

    // kick off
    timerRef.current = window.setTimeout(step, SLIDE_MS);

    return () => {
      alive = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (fadeRef.current) window.clearTimeout(fadeRef.current);
    };
  }, [nav, slides.length]);

  const slide = slides[idx];

  return (
    <div style={styles.page}>
      <img
        src={slide.img}
        alt={slide.alt}
        style={{
          ...styles.img,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(1.02)",
          transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#ffffff",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    margin: 0,
    padding: 0,
  },
  img: {
    width: "92vw",
    height: "88vh",
    objectFit: "contain",
    display: "block",
  },
};