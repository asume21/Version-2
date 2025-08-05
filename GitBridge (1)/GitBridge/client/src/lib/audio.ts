import * as Tone from "tone";

export class AudioManager {
  private synth: Tone.Synth;
  private drumKit: { [key: string]: Tone.Player };
  private isInitialized = false;

  constructor() {
    this.synth = new Tone.Synth().toDestination();
    this.drumKit = {};
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      
      // Initialize drum samples
      this.drumKit = {
        kick: new Tone.Player("/sounds/kick.wav").toDestination(),
        snare: new Tone.Player("/sounds/snare.wav").toDestination(),
        hihat: new Tone.Player("/sounds/hihat.wav").toDestination(),
      };

      this.isInitialized = true;
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }

  async playNote(note: string | number, duration: string = "8n") {
    await this.initialize();
    try {
      this.synth.triggerAttackRelease(note, duration);
    } catch (error) {
      console.warn("Failed to play note:", error);
    }
  }

  async playMelody(notes: number[], tempo: number = 120) {
    await this.initialize();
    
    try {
      Tone.Transport.bpm.value = tempo;
      
      const sequence = new Tone.Sequence((time, note) => {
        this.synth.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), "8n", time);
      }, notes, "8n");

      sequence.start();
      Tone.Transport.start();

      // Stop after the sequence completes
      setTimeout(() => {
        sequence.stop();
        Tone.Transport.stop();
        sequence.dispose();
      }, (notes.length * (60 / tempo) * 0.5) * 1000);
    } catch (error) {
      console.warn("Failed to play melody:", error);
    }
  }

  async playBeat(pattern: number[], samples: string[], bpm: number = 120) {
    await this.initialize();
    
    try {
      Tone.Transport.bpm.value = bpm;
      
      const sequence = new Tone.Sequence((time, step) => {
        if (step === 1 && this.drumKit.kick) {
          this.drumKit.kick.start(time);
        }
      }, pattern, "16n");

      sequence.start();
      Tone.Transport.start();

      // Stop after 4 bars
      setTimeout(() => {
        sequence.stop();
        Tone.Transport.stop();
        sequence.dispose();
      }, (4 * 4 * (60 / bpm)) * 1000);
    } catch (error) {
      console.warn("Failed to play beat:", error);
    }
  }

  stop() {
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (error) {
      console.warn("Failed to stop audio:", error);
    }
  }

  dispose() {
    try {
      this.synth.dispose();
      Object.values(this.drumKit).forEach(player => player.dispose());
      this.isInitialized = false;
    } catch (error) {
      console.warn("Failed to dispose audio:", error);
    }
  }
}

export const audioManager = new AudioManager();
