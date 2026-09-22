/**
 * Ambient paper-room sound + hand-drawn SFX, generated with the Web Audio API.
 *
 * Background music (audio/song.mp3) is loaded via HTML5 Audio and connected
 * to the Web Audio graph so the master gain controls both the song and the
 * ambient room tone independently.
 */

export type Sfx = 'scribe' | 'pop' | 'click' | 'chime' | 'page' | 'whoosh';

const STORAGE_KEY = 'kraft:sound';

class AudioEngine {
  private ctx: AudioContext | null = null;

  private master: GainNode | null = null;

  private ambientGain: GainNode | null = null;

  private noiseBuffer: AudioBuffer | null = null;

  private started = false;

  private trackPlaying = false;

  private trackAudio: HTMLAudioElement | null = null;

  private listeners = new Set<(muted: boolean) => void>();

  muted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      this.muted = saved === 'off';
      if (!saved) this.muted = false;
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Subscribe to mute changes (nav toggle + inline popup toggle share this). */
  subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.muted));
  }

  /** Build (or resume) the audio graph. Safe to call on every gesture. */
  async unlock(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private createNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx as AudioContext;
    const length = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /** Start the looping ambient room tone (idempotent). */
  async startAmbient(): Promise<void> {
    await this.unlock();
    if (!this.ctx || !this.master || !this.noiseBuffer || this.started) return;
    const ctx = this.ctx;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = this.muted ? 0 : 0.85;
    this.ambientGain.connect(this.master);

    // 1. Slow breathing pad: detuned sines through a lowpass.
    const pad = ctx.createGain();
    pad.gain.value = 0.05;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    pad.connect(filter).connect(this.ambientGain);

    [110, 164.81, 220].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.detune.value = index === 1 ? 7 : -5;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.35 / (index + 1);
      osc.connect(oscGain).connect(pad);
      osc.start();
    });

    // 2. Paper-room air: looping filtered noise with a wandering bandpass.
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 620;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.16;
    noise.connect(noiseFilter).connect(noiseGain).connect(this.ambientGain);
    noise.start();

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 240;
    lfo.connect(lfoGain).connect(noiseFilter.frequency);
    lfo.start();

    this.started = true;
    this.emit();
  }

  async toggle(): Promise<void> {
    await this.setMuted(!this.muted);
  }

  /**
   * Load and loop an audio file (e.g. audio/song.mp3).
   * Pure HTML5 Audio — no AudioContext needed, so it can autoplay
   * using the muted trick without a user gesture.
   */
  async playTrack(_path: string): Promise<void> {
    try {
      const audio = document.getElementById('bg-music') as HTMLAudioElement | null;
      if (!audio) return;
      audio.loop = true;
      audio.volume = this.muted ? 0 : 0.85;
      this.trackAudio = audio;

      if (this.trackPlaying) {
        // Already playing (muted autoplay) — just sync mute state.
        audio.muted = this.muted;
        return;
      }

      if (audio.paused) {
        await audio.play();
      }
      audio.muted = this.muted;
      this.trackPlaying = true;
      console.log('[audio] track playing:', audio.src);
    } catch (err) {
      console.log('[audio] track failed:', err);
    }
  }

  async setMuted(muted: boolean): Promise<void> {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on');
    }
    if (this.trackAudio) {
      this.trackAudio.volume = muted ? 0 : 0.85;
      if (muted) {
        this.trackAudio.pause();
      } else {
        void this.trackAudio.play();
      }
    }
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.85, now, 0.25);
    }
    if (this.ambientGain) {
      const now = this.ctx!.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : 0.85, now, 0.25);
    }
    this.emit();
  }

  /** Fire a hand-drawn SFX. Silent while muted or before the first gesture. */
  play(effect: Sfx, intensity = 1): void {
    if (!this.ctx || this.muted) return;
    switch (effect) {
      case 'scribe':
        this.noiseBurst({
          duration: 0.14 * intensity,
          type: 'bandpass',
          frequency: 1800 + Math.random() * 900,
          Q: 1.4,
          gain: 0.05 * intensity,
          sweepTo: 3200,
          pan: (Math.random() - 0.5) * 0.5,
        });
        break;
      case 'page':
        this.noiseBurst({
          duration: 0.32,
          type: 'highpass',
          frequency: 900,
          gain: 0.07,
          sweepTo: 2600,
          pan: (Math.random() - 0.5) * 0.4,
        });
        break;
      case 'pop':
        this.tone(520, 0.16, 0.08, 'triangle', 1200);
        this.noiseBurst({ duration: 0.1, type: 'bandpass', frequency: 2400, gain: 0.05 });
        break;
      case 'click':
        this.noiseBurst({ duration: 0.06, type: 'bandpass', frequency: 1500, Q: 2, gain: 0.045 });
        break;
      case 'whoosh':
        this.noiseBurst({ duration: 0.55, type: 'lowpass', frequency: 1200, gain: 0.08, sweepTo: 220 });
        break;
      case 'chime':
        [523.25, 659.25, 783.99].forEach((freq, index) => {
          window.setTimeout(() => this.tone(freq, 0.7, 0.05, 'sine'), index * 110);
        });
        break;
      default:
        break;
    }
  }

  private noiseBurst(options: {
    duration: number;
    type: BiquadFilterType;
    frequency: number;
    Q?: number;
    gain: number;
    sweepTo?: number;
    pan?: number;
  }): void {
    if (!this.ctx || !this.master || !this.noiseBuffer || this.muted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.playbackRate.value = 0.85 + Math.random() * 0.4;

    const filter = ctx.createBiquadFilter();
    filter.type = options.type;
    filter.frequency.setValueAtTime(options.frequency, now);
    filter.Q.value = options.Q ?? 1;
    if (options.sweepTo) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, options.sweepTo), now + options.duration);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(options.gain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);

    const panner = ctx.createStereoPanner();
    panner.pan.value = options.pan ?? 0;

    source.connect(filter).connect(gain).connect(panner).connect(this.master);
    source.start(now);
    source.stop(now + options.duration + 0.05);
  }

  private tone(
    frequency: number,
    duration: number,
    gain: number,
    type: OscillatorType = 'sine',
    glideTo?: number,
  ): void {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(glideTo, now + duration);
    }
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gain, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(env).connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}

export const audio = new AudioEngine();

/** Attach the gesture listener that unlocks Web Audio (ambient + SFX). */
export function armAudioUnlock(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => {
    if (!audio.isMuted) {
      void audio.startAmbient();
    }
    void audio.playTrack('/audio/song.mp3');
  };
  // Chrome only treats pointerdown/keydown as valid AudioContext gestures.
  const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown'];
  events.forEach((event) => window.addEventListener(event, handler, { passive: true }));
  return () => events.forEach((event) => window.removeEventListener(event, handler));
}
