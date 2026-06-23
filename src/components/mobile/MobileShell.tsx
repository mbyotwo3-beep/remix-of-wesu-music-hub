import type { ReactNode } from "react";
import { BottomTabBar } from "./BottomTabBar";
import { MiniPlayer } from "./MiniPlayer";
import { StatusBarInit } from "./StatusBarInit";

interface MobileShellProps {
  children: ReactNode;
}

/**
 * Top-level layout wrapper for native (Capacitor) platform.
 * Replaces Navbar + PlayerBar with BottomTabBar + MiniPlayer.
 * Applies safe-area insets so content is never obscured.
 *
 * Feature: wesu-plus-completion
 */
export function MobileShell({ children }: MobileShellProps) {
  return (
    <>
      <StatusBarInit />
      <div className="pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+4rem+3.5rem)]">
        {children}
      </div>
      <MiniPlayer />
      <BottomTabBar />
    </>
  );
}
