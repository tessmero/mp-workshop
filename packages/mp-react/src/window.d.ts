/**
 * @file window.d.ts
 * 
 * Allow accessing global window.MusicManager and window.SONGS.
 */

declare global {
  interface MusicManagerType {
    outNode: {
      gain: { value: number };
    };
    stopMusic: () => void;
    startMusicLoop: (data: unknown) => void;
  }

  interface Window {
    MusicManager: () => MusicManagerType;
    SONGS: Record<string, unknown>;
  }
}

export {};
