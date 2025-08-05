import * as Tone from "tone";

export class AudioManager {
  private synth: Tone.Synth;
  private drumKit: { [key: string]: any };
  private isInitialized = false;
  private currentSequence: Tone.Sequence | null = null;

  constructor() {
    this.synth = new Tone.Synth().toDestination();
    this.drumKit = {};
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log("Initializing Tone.js audio context...");
      await Tone.start();
      console.log("Tone.js started, audio context state:", Tone.getContext().state);
      
      // Create synthesized drum sounds instead of loading files
      this.drumKit = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
        }).toDestination(),
        
        snare: new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 }
        }).toDestination(),
        
        hihat: new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination()
      };

      console.log("Drum kit created:", Object.keys(this.drumKit));
      
      // Test audio by playing a quick sound
      this.drumKit.kick.triggerAttackRelease("C1", "8n");
      console.log("Test kick sound triggered");

      this.isInitialized = true;
    } catch (error) {
      console.error("Audio initialization failed:", error);
      throw error;
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
      // Stop any existing sequence
      if (this.currentSequence) {
        this.currentSequence.stop();
        this.currentSequence.dispose();
      }
      
      Tone.Transport.bpm.value = bpm;
      
      // Create a simpler, more reliable drum pattern
      console.log("Playing beat pattern:", pattern);
      
      this.currentSequence = new Tone.Sequence((time, index) => {
        // Always play something so we can hear it's working
        if (index % 4 === 0) {
          // Kick on main beats (1, 5, 9, 13)
          this.drumKit.kick.triggerAttackRelease("C1", "8n", time);
          console.log("Playing kick at step", index);
        }
        
        if (index === 4 || index === 12) {
          // Snare on backbeat
          this.drumKit.snare.triggerAttackRelease("8n", time);
          console.log("Playing snare at step", index);
        }
        
        // Hi-hat on every step for consistent rhythm
        this.drumKit.hihat.triggerAttackRelease("32n", time, 0.2);
        
        // Additional sounds based on AI pattern
        if (pattern[index] === 1 && index % 4 !== 0 && index !== 4 && index !== 12) {
          this.drumKit.kick.triggerAttackRelease("C2", "16n", time + 0.1);
        }
      }, Array.from({ length: 16 }, (_, i) => i), "16n");

      this.currentSequence.start();
      Tone.Transport.start();

      // Loop the pattern
      this.currentSequence.loop = true;
      
    } catch (error) {
      console.warn("Failed to play beat:", error);
    }
  }

  stop() {
    try {
      if (this.currentSequence) {
        this.currentSequence.stop();
        this.currentSequence.dispose();
        this.currentSequence = null;
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (error) {
      console.warn("Failed to stop audio:", error);
    }
  }

  dispose() {
    try {
      this.stop();
      this.synth.dispose();
      Object.values(this.drumKit).forEach(instrument => instrument.dispose());
      this.isInitialized = false;
    } catch (error) {
      console.warn("Failed to dispose audio:", error);
    }
  }
}

export const audioManager = new AudioManager();
