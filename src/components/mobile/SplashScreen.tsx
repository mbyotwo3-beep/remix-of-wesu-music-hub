import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
  /** Duration in ms before the splash fades out. Default: 2200 */
  duration?: number;
}

/**
 * Full-screen animated splash screen shown on app launch.
 * Displays the WESU+ brand logo with a pulse + fade-in animation,
 * then fades the whole screen out and calls `onDone`.
 *
 * Feature: wesu-plus-completion
 */
export function SplashScreen({ onDone, duration = 2200 }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // Fade logo in (600 ms), then hold, then fade screen out
    const holdTimer = setTimeout(() => setPhase("out"), duration - 500);
    const doneTimer = setTimeout(onDone, duration);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-card, #ffffff)",
        transition: "opacity 0.5s ease",
        opacity: phase === "out" ? 0 : 1,
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "scale(0.85)" : "scale(1)",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          animation: phase !== "in" ? "wesu-logo-pulse 1.8s ease-in-out infinite" : "none",
        }}
      >
        <img
          src="/images/wesu-splash-logo.png"
          alt="WESU+ logo"
          style={{ width: "260px", maxWidth: "72vw", height: "auto", display: "block" }}
          // trigger the "in → hold" transition on load
          onLoad={(e) => {
            // small rAF to let the "opacity:0 + scale:0.85" paint first
            requestAnimationFrame(() => {
              setTimeout(() => setPhase("hold"), 50);
            });
          }}
        />
      </div>

      {/* Tagline */}
      <p
        style={{
          marginTop: "1.5rem",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.875rem",
          letterSpacing: "0.18em",
          color: "var(--color-foreground, #1a2a6e)",
          textTransform: "uppercase",
          opacity: phase === "hold" ? 1 : 0,
          transition: "opacity 0.8s ease 0.3s",
        }}
      >
        Your music. Your world.
      </p>

      {/* Spinning ring loader */}
      <div
        style={{
          marginTop: "2.5rem",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "3px solid #e0e5f7",
          borderTopColor: "#cc2121",
          opacity: phase === "hold" ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
          animation: "wesu-spin 0.9s linear infinite",
        }}
      />

      <style>{`
        @keyframes wesu-logo-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.03); }
        }
        @keyframes wesu-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
