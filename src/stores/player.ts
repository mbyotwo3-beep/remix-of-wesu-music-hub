import { create } from "zustand";

export interface PlayerTrack {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
  durationSeconds?: number | null;
}

interface PlayerState {
  track: PlayerTrack | null;
  playing: boolean;
  liked: boolean;
  progressSeconds: number;
  setTrack: (t: PlayerTrack | null) => void;
  togglePlay: () => void;
  setProgress: (s: number) => void;
  toggleLike: () => void;
}

export const usePlayer = create<PlayerState>((set) => ({
  track: null,
  playing: false,
  liked: false,
  progressSeconds: 0,
  setTrack: (t) => set({ track: t, playing: !!t, progressSeconds: 0 }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setProgress: (s) => set({ progressSeconds: s }),
  toggleLike: () => set((s) => ({ liked: !s.liked })),
}));
