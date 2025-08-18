import * as Tone from "tone";
import type { SequencerState, TrackId } from "@/lib/sequencer";

export class AudioManager {
  private synth: Tone.Synth | null = null;
  private drumKit: { [key: string]: any };
  private isInitialized = false;
  private currentSequence: Tone.Sequence | null = null;
  private trackInstruments: Partial<Record<TrackId, any>> = {};

  constructor() {
    this.drumKit = {};
  }

  async playSequencer(state: SequencerState) {
    await this.initialize();
    try {
      // Stop any existing sequence
      if (this.currentSequence) {
        this.currentSequence.stop();
        this.currentSequence.dispose();
      }

      this.setBpm(state.bpm);

      const totalSteps = state.bars * state.stepsPerBar;

      // Build step activation map per track for the whole timeline
      const stepMap: Partial<Record<TrackId, boolean[]>> = {};
      for (const track of state.tracks) {
        const arr = Array<boolean>(totalSteps).fill(false);
        for (const clip of track.clips) {
          for (let i = 0; i < clip.length; i++) {
            const globalStep = clip.start + i;
            if (globalStep >= 0 && globalStep < totalSteps) {
              arr[globalStep] = arr[globalStep] || !!clip.steps[i]?.active;
            }
          }
        }
        stepMap[track.id as TrackId] = arr;
      }

      const indices = Array.from({ length: totalSteps }, (_, i) => i);
      this.currentSequence = new Tone.Sequence((time, stepIndex: number) => {
        // Determine if any solo is active
        const anySolo = state.tracks.some((t) => t.solo);

        for (const t of state.tracks) {
          const id = t.id as TrackId;
          const active = stepMap[id]?.[stepIndex];
          if (!active) continue;
          if (t.mute) continue;
          if (anySolo && !t.solo) continue;

          const inst = (this.trackInstruments[id] || this.drumKit.hihat);

          // Trigger per instrument with simple defaults
          switch (id) {
            case "kick":
              inst.triggerAttackRelease("C1", "8n", time);
              break;
            case "snare":
              inst.triggerAttackRelease("8n", time);
              break;
            case "hhc":
              inst.triggerAttackRelease("32n", time, 0.3);
              break;
            case "hho":
              inst.triggerAttackRelease("8n", time, 0.4);
              break;
            case "tom1":
              inst.triggerAttackRelease("G1", "8n", time);
              break;
            case "tom2":
              inst.triggerAttackRelease("F1", "8n", time);
              break;
            case "tom3":
              inst.triggerAttackRelease("D1", "8n", time);
              break;
            case "ride":
              inst.triggerAttackRelease("4n", time, 0.5);
              break;
            case "crash":
              inst.triggerAttackRelease("2n", time, 0.6);
              break;
            default:
              this.drumKit.hihat.triggerAttackRelease("32n", time, 0.2);
          }
        }
      }, indices, "16n");

      this.currentSequence.loop = true;
      this.currentSequence.start(0);
      Tone.Transport.start();
    } catch (error) {
      console.warn("Failed to play sequencer:", error);
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log("Initializing Tone.js audio context...");
      await Tone.start();
      console.log("Tone.js started, audio context state:", Tone.getContext().state);
      // Create core synth only after the context is started (requires a user gesture)
      this.synth = this.synth ?? new Tone.Synth().toDestination();
      
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

      // Map sequencer track instruments
      this.trackInstruments = {
        kick: this.drumKit.kick,
        snare: this.drumKit.snare,
        hhc: new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
          harmonicity: 5,
          modulationIndex: 30,
          resonance: 5000,
          octaves: 1.5,
        }).toDestination(),
        hho: new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.3, release: 0.05 },
          harmonicity: 5,
          modulationIndex: 30,
          resonance: 4000,
          octaves: 1.5,
        }).toDestination(),
        tom1: new Tone.MembraneSynth({ octaves: 4, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.2 } }).toDestination(),
        tom2: new Tone.MembraneSynth({ octaves: 4, envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 0.25 } }).toDestination(),
        tom3: new Tone.MembraneSynth({ octaves: 4, envelope: { attack: 0.001, decay: 0.6, sustain: 0.01, release: 0.3 } }).toDestination(),
        ride: new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 1.2, release: 0.2 }, resonance: 7000 }).toDestination(),
        crash: new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 1.8, release: 0.3 }, resonance: 6000 }).toDestination(),
      };

      console.log("Drum kit created:", Object.keys(this.drumKit));

      this.isInitialized = true;
    } catch (error) {
      console.error("Audio initialization failed:", error);
      throw error;
    }
  }

  setBpm(bpm: number) {
    try {
      Tone.Transport.bpm.value = bpm;
    } catch (error) {
      // noop
    }
  }

  async playNote(note: string | number, duration: string = "8n") {
    await this.initialize();
    try {
      if (!this.synth) return; // synth is created in initialize()
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
        if (!this.synth) return;
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
      if (this.synth) {
        this.synth.dispose();
        this.synth = null;
      }
      Object.values(this.drumKit).forEach(instrument => instrument.dispose());
      this.isInitialized = false;
    } catch (error) {
      console.warn("Failed to dispose audio:", error);
    }
  }
}

export const audioManager = new AudioManager();
