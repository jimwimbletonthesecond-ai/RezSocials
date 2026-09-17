export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration?: number;
}

export const SOUNDTRACKS: AudioTrack[] = [
  {
    id: 'ambient-1',
    title: 'Neon Drift (Original Theme)',
    artist: 'RezSound Audio',
    src: '/audio/main-track-1.wav',
  },
  {
    id: 'ambient-2',
    title: 'Midnight Grid (Chill Synth)',
    artist: 'RezSound Audio',
    src: '/audio/main-track-2.wav',
  },
  {
    id: 'ambient-3',
    title: 'Starlight Horizon (Deep Space)',
    artist: 'RezSound Audio',
    src: '/audio/main-track-3.wav',
  },
];

export const UI_AUDIO_EFFECTS = {
  loading: '/audio/loading-music.wav',
  complete: '/audio/loading-complete.wav',
};
