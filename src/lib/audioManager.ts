import { SOUNDTRACKS, AudioTrack, UI_AUDIO_EFFECTS } from './audioConfig';

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxAudio: HTMLAudioElement | null = null;
  private currentTrackIndex = 0;
  private isBgmPlaying = false;
  private masterVolume = 0.5;
  private sfxVolume = 0.7;
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('rez_master_volume');
        if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
      } catch (_) {}
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getCurrentTrack(): AudioTrack {
    return SOUNDTRACKS[this.currentTrackIndex] || SOUNDTRACKS[0];
  }

  public getIsPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.masterVolume;
    }
    try {
      localStorage.setItem('rez_master_volume', this.masterVolume.toString());
    } catch (_) {}
    this.notify();
  }

  public async playBgm(trackIndex?: number) {
    if (typeof window === 'undefined') return;

    if (trackIndex !== undefined && trackIndex >= 0 && trackIndex < SOUNDTRACKS.length) {
      this.currentTrackIndex = trackIndex;
    }

    const track = this.getCurrentTrack();

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.addEventListener('ended', () => {
        this.nextTrack();
      });
    }

    if (this.bgmAudio.src !== window.location.origin + track.src && !this.bgmAudio.src.endsWith(track.src)) {
      this.bgmAudio.src = track.src;
    }

    this.bgmAudio.volume = this.masterVolume;

    try {
      await this.bgmAudio.play();
      this.isBgmPlaying = true;
    } catch (err) {
      console.warn('[AUDIO] Auto-play was prevented by browser interaction policy:', err);
      this.isBgmPlaying = false;
    }
    this.notify();
  }

  public pauseBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
      this.notify();
    }
  }

  public toggleBgm() {
    if (this.isBgmPlaying) {
      this.pauseBgm();
    } else {
      this.playBgm();
    }
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % SOUNDTRACKS.length;
    if (this.isBgmPlaying) {
      this.playBgm();
    } else {
      this.notify();
    }
  }

  public prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + SOUNDTRACKS.length) % SOUNDTRACKS.length;
    if (this.isBgmPlaying) {
      this.playBgm();
    } else {
      this.notify();
    }
  }

  public playSfx(type: keyof typeof UI_AUDIO_EFFECTS) {
    if (typeof window === 'undefined') return;
    try {
      const sfx = new Audio(UI_AUDIO_EFFECTS[type]);
      sfx.volume = this.masterVolume * this.sfxVolume;
      sfx.play().catch(() => {});
    } catch (_) {}
  }
}

export const audioManager = new AudioManager();
