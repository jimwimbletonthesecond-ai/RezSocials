import { useState, useEffect } from 'react';
import { audioManager } from './audioManager';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(audioManager.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioManager.getCurrentTrack());
  const [volume, setVolume] = useState(audioManager.getMasterVolume());

  useEffect(() => {
    const unsub = audioManager.subscribe(() => {
      setIsPlaying(audioManager.getIsPlaying());
      setCurrentTrack(audioManager.getCurrentTrack());
      setVolume(audioManager.getMasterVolume());
    });
    return unsub;
  }, []);

  return {
    isPlaying,
    currentTrack,
    volume,
    setVolume: (v: number) => audioManager.setMasterVolume(v),
    toggleBgm: () => audioManager.toggleBgm(),
    playBgm: (index?: number) => audioManager.playBgm(index),
    pauseBgm: () => audioManager.pauseBgm(),
    nextTrack: () => audioManager.nextTrack(),
    prevTrack: () => audioManager.prevTrack(),
    playSfx: (type: 'loading' | 'complete') => audioManager.playSfx(type),
  };
}
