import { GameState } from '../core/GameState';

/**
 * Web Audio procedural synthesizer and sound system.
 * Generates original zero-copyright BGM and SFX in-browser,
 * handling mobile and browser autoplay policies with user-gesture unlock.
 */
export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  private constructor() {
    // AudioContext will be initialized on first user interaction
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateVolumes();

      // Listen for first user gesture to unlock AudioContext
      const unlock = () => {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            this.isUnlocked = true;
            this.startBGM();
          });
        } else {
          this.isUnlocked = true;
          this.startBGM();
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };

      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    } catch (e) {
      console.warn('Web Audio not supported in this environment:', e);
    }
  }

  public updateVolumes(): void {
    if (!this.masterGain || !this.bgmGain || !this.sfxGain) return;
    const settings = GameState.settings;
    const master = settings.isMuted ? 0 : settings.masterVolume;
    this.masterGain.gain.setValueAtTime(master, this.ctx?.currentTime || 0);
    this.bgmGain.gain.setValueAtTime(settings.musicVolume * 0.4, this.ctx?.currentTime || 0);
    this.sfxGain.gain.setValueAtTime(settings.sfxVolume * 0.5, this.ctx?.currentTime || 0);
  }

  public startBGM(): void {
    if (!this.ctx || !this.isUnlocked || this.bgmTimer) return;

    // Ambient Synth-Chiptune Melodic Loop (Ember Outpost Day Theme)
    // Scale: A minor pentatonic (A, C, D, E, G)
    const melody = [
      220.00, 261.63, 329.63, 392.00,
      329.63, 261.63, 293.66, 220.00,
      196.00, 220.00, 261.63, 329.63,
      293.66, 261.63, 220.00, 196.00
    ];

    const bass = [
      110.00, 110.00, 130.81, 130.81,
      146.83, 146.83, 164.81, 164.81
    ];

    this.bgmStep = 0;
    this.bgmTimer = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;

      const time = this.ctx.currentTime;
      const freq = melody[this.bgmStep % melody.length];
      const bassFreq = bass[Math.floor(this.bgmStep / 2) % bass.length];

      // Lead Bell Synth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      osc.connect(gain);
      if (this.bgmGain) gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + 0.5);

      // Warm Sub-Bass Pulse (every 2 steps)
      if (this.bgmStep % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, time);

        bassGain.gain.setValueAtTime(0.12, time);
        bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

        bassOsc.connect(bassGain);
        if (this.bgmGain) bassGain.connect(this.bgmGain);

        bassOsc.start(time);
        bassOsc.stop(time + 0.85);
      }

      this.bgmStep++;
    }, 450); // ~133 BPM gentle ambient tempo
  }

  public stopBGM(): void {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // --- Tactile SFX Synthesizers ---

  public playFootstep(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.06);

    gain.gain.setValueAtTime(0.03, time);
    gain.gain.linearRampToValueAtTime(0, time + 0.06);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.07);
  }

  public playUIClick(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(440, time + 0.04);

    gain.gain.setValueAtTime(0.05, time);
    gain.gain.linearRampToValueAtTime(0, time + 0.04);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  public playInteractChime(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = time + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.08, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  public playSuccessFanfare(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major fanfare

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = time + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.07, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  public playError(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.linearRampToValueAtTime(110, time + 0.15);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.linearRampToValueAtTime(0, time + 0.15);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  public playHarvest(type: 'wood' | 'crystals' | 'stone'): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;

    if (type === 'crystals') {
      const notes = [659.25, 987.77, 1318.51]; // High crystal resonance
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + idx * 0.04);
        gain.gain.setValueAtTime(0.08, time + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.04 + 0.25);
        osc.connect(gain);
        if (this.sfxGain) gain.connect(this.sfxGain);
        osc.start(time + idx * 0.04);
        osc.stop(time + idx * 0.04 + 0.26);
      });
    } else if (type === 'wood') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.12);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.15);
    } else {
      // stone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, time);
      osc.frequency.linearRampToValueAtTime(120, time + 0.1);
      gain.gain.setValueAtTime(0.09, time);
      gain.gain.linearRampToValueAtTime(0, time + 0.1);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.12);
    }
  }

  public playNeedleHit(quality: 'perfect' | 'excellent' | 'good' | 'miss'): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;

    if (quality === 'perfect') {
      [880, 1320].forEach(f => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gain);
        if (this.sfxGain) gain.connect(this.sfxGain);
        osc.start(time);
        osc.stop(time + 0.36);
      });
    } else if (quality === 'excellent') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, time);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.26);
    } else if (quality === 'good') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.21);
    } else {
      // miss
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.linearRampToValueAtTime(0, time + 0.18);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.2);
    }
  }

  public playLevelUp(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const notes = [329.63, 440.00, 554.37, 659.25, 880.00]; // E, A, C#, E, A ascending
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = time + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.09, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  public playSmelt(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(360, time + 0.2);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + 0.36);
  }

  // --- COMBAT & SIEGE SYNTHESIZERS ---

  public playLaserShot(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(140, time + 0.12);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.13);
  }

  public playMortarLaunch(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.2);

    gain.gain.setValueAtTime(0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  public playExplosion(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.35);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }

  public playTeslaZap(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, time);
    osc.frequency.setValueAtTime(660, time + 0.04);
    osc.frequency.setValueAtTime(330, time + 0.08);

    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  public playDemolition(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.5);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.52);
  }

  public playUnitDeploy(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, time);
    osc.frequency.setValueAtTime(780, time + 0.05);

    gain.gain.setValueAtTime(0.07, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.13);
  }

  public playAlarmSiren(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, time);
    osc.frequency.linearRampToValueAtTime(750, time + 0.2);
    osc.frequency.linearRampToValueAtTime(450, time + 0.4);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.46);
  }

  public playStarEarned(): void {
    if (!this.ctx || this.ctx.state !== 'running' || GameState.settings.isMuted) return;
    const time = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = time + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.1, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }
}

export const Audio = AudioManager.getInstance();
