import { useState, useCallback, type ReactNode } from "react";
import { BottomTabBar } from "./BottomTabBar";
import { MiniPlayer } from "./MiniPlayer";
import { StatusBarInit } from "./StatusBarInit";
import { SplashScreen } from "./SplashScreen";

interface MobileShellProps {
  children: ReactNode;
}

/**
 * Top-level layout wrapper for native (Capacitor) platform.
 * Replaces Navbar + PlayerBar with BottomTabBar + MiniPlayer.
 * Applies safe-area insets so content is never obscured.
 * Shows a branded splash screen once per session on launch.
 *
 * Feature: wesu-plus-completion
 */
export function MobileShell({ children }: MobileShellProps) {
  const [showSplash, setShowSplash] = useState(
    () => typeof window !== "undefined" && !sessionStorage.getItem("wesu_splash_shown"),
  );

  const handleSplashDone = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("wesu_splash_shown", "1");
    }
    setShowSplash(false);
  }, []);

  return (
    <>
      <StatusBarInit />
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <div className="pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+4rem+3.5rem)]">
        {children}
      </div>
      <MiniPlayer />
      <BottomTabBar />
    </>
  );
}
