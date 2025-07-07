// Simple sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private enabled: boolean = true;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Generate simple tones for game sounds
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
      }
      
      // Apply envelope (fade out)
      const envelope = Math.max(0, 1 - (t / duration));
      data[i] = sample * envelope * 0.1; // Keep volume low
    }

    return buffer;
  }

  // Initialize sound effects
  initSounds() {
    if (!this.audioContext) return;

    // Create different sound effects
    this.sounds.dot = this.createTone(800, 0.1, 'sine') || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.powerPellet = this.createTone(400, 0.3, 'square') || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.eatGhost = this.createTone(600, 0.5, 'triangle') || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.death = this.createTone(200, 1.0, 'triangle') || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.levelComplete = this.createTone(1000, 0.8, 'sine') || new AudioBuffer({ length: 1, sampleRate: 44100 });
  }

  playSound(soundName: string) {
    if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      source.connect(this.audioContext.destination);
      source.start();
    } catch (e) {
      console.warn('Failed to play sound:', soundName);
    }
  }

  // Resume audio context (required for user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const soundManager = new SoundManager();

// Initialize sounds when module loads
soundManager.initSounds();
