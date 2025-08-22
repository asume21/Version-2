import React, { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Zap } from "lucide-react";
import { audioManager } from "@/lib/audio";
import { beatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  SequencerState,
  Track,
  Clip,
  Step,
  TrackId,
  createDefaultState,
  createEmptyClip,
  DEFAULT_TRACKS,
} from "@/lib/sequencer";

const CELL_PX = 22;

type Props = {
  initial?: SequencerState;
};

export default function Sequencer({ initial }: Props) {
  const [state, setState] = useState<SequencerState>(
    () => initial ?? createDefaultState(4, 16)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLength, setSelectedLength] = useState<number>(8); // 4/8/16
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const totalSteps = state.bars * state.stepsPerBar;

  const barIndices = useMemo(() => Array.from({ length: state.bars }, (_, i) => i), [state.bars]);
  const stepIndices = useMemo(
    () => Array.from({ length: totalSteps }, (_, i) => i),
    [totalSteps]
  );

  const handlePlay = async () => {
    await audioManager.initialize();
    if (isPlaying) {
      audioManager.stop();
      setIsPlaying(false);
    } else {
      await audioManager.playSequencer(state);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    audioManager.stop();
    setIsPlaying(false);
  };

  // Apply a simple AI-generated pattern to the sequencer tracks
  function applyAIPatternToSequencer(pattern: number[]) {
    const totalSteps = state.bars * state.stepsPerBar;
    const pLen = Math.max(1, pattern?.length ?? 1);

    const kick = createEmptyClip(0, totalSteps, "AI Kick");
    const snare = createEmptyClip(0, totalSteps, "AI Snare");
    const hat = createEmptyClip(0, totalSteps, "AI Hi-hat");

    for (let i = 0; i < totalSteps; i++) {
      const stepInBar = i % state.stepsPerBar;
      const aiOn = !!pattern?.[i % pLen];

      // Kick: main beats plus AI accents
      if (i % 4 === 0 || aiOn) {
        kick.steps[i] = { active: true, velocity: 1 } as Step;
      }

      // Snare: backbeat on 2 and 4 (assuming 16 steps per bar)
      if (stepInBar === 4 || stepInBar === 12) {
        snare.steps[i] = { active: true, velocity: 1 } as Step;
      }

      // Hi-hat: every step for steady rhythm
      hat.steps[i] = { active: true, velocity: 0.6 } as Step;
    }

    setState((s) => {
      const tracks = s.tracks.map((t) => {
        if (t.id === "kick") return { ...t, clips: [kick] } as Track;
        if (t.id === "snare") return { ...t, clips: [snare] } as Track;
        if (t.id === "hhc") return { ...t, clips: [hat] } as Track;
        return { ...t, clips: [] } as Track;
      });
      return { ...s, tracks };
    });
  }

  const aiGenerate = useMutation({
    mutationFn: async () => {
      // Minimal defaults; can be expanded with UI controls later
      return await beatAPI.generate({
        genre: "Hip-Hop",
        bpm: state.bpm,
        duration: state.bars,
        aiProvider: "grok",
      });
    },
    onSuccess: (data) => {
      applyAIPatternToSequencer(data.pattern || []);
      toast({ title: "AI pattern applied", description: data.description || "Sequencer filled from AI." });
    },
    onError: (err: any) => {
      toast({ title: "AI generate failed", description: err?.message || "Unknown error", variant: "destructive" });
    },
  });

  const handleAIGenerate = () => aiGenerate.mutate();

  const addClipAt = (trackIndex: number, stepIndex: number) => {
    const start = Math.max(0, Math.min(stepIndex, totalSteps - 1));
    const length = Math.min(selectedLength, totalSteps - start);
    const newClip = createEmptyClip(start, length, String(length));

    setState((s) => {
      const tracks = s.tracks.map((t, i) =>
        i === trackIndex ? { ...t, clips: [...t.clips, newClip] } : t
      );
      return { ...s, tracks };
    });
  };

  const removeClip = (trackIndex: number, clipId: string) => {
    setState((s) => {
      const tracks = s.tracks.map((t, i) =>
        i === trackIndex ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) } : t
      );
      return { ...s, tracks };
    });
  };

  const toggleStepInClip = (
    trackIndex: number,
    clipId: string,
    localStep: number
  ) => {
    setState((s) => {
      const tracks = s.tracks.map((t, i) => {
        if (i !== trackIndex) return t;
        const clips = t.clips.map((c) => {
          if (c.id !== clipId) return c;
          const steps = c.steps.slice();
          const prev = steps[localStep];
          steps[localStep] = { active: !prev?.active, velocity: prev?.velocity ?? 1 } as Step;
          return { ...c, steps };
        });
        return { ...t, clips };
      });
      return { ...s, tracks };
    });
  };

  const setBpm = (v: number) => {
    setState((s) => ({ ...s, bpm: v }));
    audioManager.setBpm?.(v);
  };

  const gridWidth = totalSteps * CELL_PX;

  return (
    <Card className="bg-github-secondary border-github-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sequencer</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlay}
              className="bg-accent-cyan/20 hover:bg-accent-cyan/30"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={handleStop}>
              <Square className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleAIGenerate} disabled={aiGenerate.isPending}>
              <Zap className="h-4 w-4 mr-1" />
              {aiGenerate.isPending ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium">BPM: {state.bpm}</label>
            <Slider value={[state.bpm]} onValueChange={(v) => setBpm(v[0])} min={60} max={200} step={1} />
          </div>
          <div>
            <label className="text-xs font-medium">Bars: {state.bars}</label>
            <div className="text-xs text-github-text-secondary">Fixed 16th grid · {totalSteps} steps</div>
          </div>
          <div>
            <label className="text-xs font-medium">Clip Length</label>
            <div className="flex gap-2 mt-2">
              {[4, 8, 16].map((len) => (
                <Button
                  key={len}
                  size="sm"
                  variant={selectedLength === len ? "default" : "outline"}
                  onClick={() => setSelectedLength(len)}
                >
                  {len}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          {/* Timeline header */}
          <div className="sticky top-0 z-10 bg-github-secondary" style={{ width: gridWidth }}>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, ${CELL_PX}px)` }}>
              {stepIndices.map((i) => (
                <div
                  key={i}
                  className={`h-6 text-[10px] flex items-center justify-center border-b border-github-border ${
                    i % state.stepsPerBar === 0 ? "border-l-2 border-l-accent-pink" : "border-l border-github-border/30"
                  }`}
                >
                  {i % state.stepsPerBar === 0 ? i / state.stepsPerBar + 1 : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <div ref={gridRef} className="space-y-2">
            {state.tracks.map((track, tIdx) => (
              <div key={track.id} className="flex">
                {/* Track header */}
                <div className="w-36 shrink-0 pr-2 flex items-center justify-between">
                  <div className="text-xs font-medium truncate">{track.name}</div>
                  <div className="flex gap-1">
                    {/* mute/solo placeholders for future */}
                  </div>
                </div>

                {/* Track grid */}
                <div
                  className="relative grow"
                  style={{ width: gridWidth }}
                >
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${totalSteps}, ${CELL_PX}px)` }}
                  >
                    {stepIndices.map((i) => (
                      <div
                        key={i}
                        className={`h-8 border-b border-github-border/40 ${
                          i % state.stepsPerBar === 0 ? "border-l-2 border-l-accent-pink" : "border-l border-github-border/30"
                        } hover:bg-white/5 cursor-pointer`}
                        onClick={() => addClipAt(tIdx, i)}
                        title="Click to add clip here"
                      />
                    ))}
                  </div>

                  {/* Clips */}
                  {track.clips.map((clip) => (
                    <ClipView
                      key={clip.id}
                      clip={clip}
                      totalSteps={totalSteps}
                      stepsPerBar={state.stepsPerBar}
                      onRemove={() => removeClip(tIdx, clip.id)}
                      onToggleStep={(localIndex) => toggleStepInClip(tIdx, clip.id, localIndex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClipView({
  clip,
  totalSteps,
  stepsPerBar,
  onRemove,
  onToggleStep,
}: {
  clip: Clip;
  totalSteps: number;
  stepsPerBar: number;
  onRemove: () => void;
  onToggleStep: (localIndex: number) => void;
}) {
  const widthPx = clip.length * CELL_PX;
  const leftPx = clip.start * CELL_PX;

  const localIndices = useMemo(
    () => Array.from({ length: clip.length }, (_, i) => i),
    [clip.length]
  );

  return (
    <div
      className="absolute top-0 h-8 rounded-sm overflow-hidden border border-accent-cyan/60 bg-accent-cyan/10"
      style={{ left: leftPx, width: widthPx }}
    >
      {/* header */}
      <div className="h-4 text-[10px] px-1 flex items-center justify-between bg-accent-cyan/20 select-none">
        <span className="font-semibold">{clip.name ?? clip.length}</span>
        <button className="opacity-70 hover:opacity-100" onClick={onRemove} title="Delete clip">
          ×
        </button>
      </div>
      {/* inner steps */}
      <div
        className="grid h-4"
        style={{ gridTemplateColumns: `repeat(${clip.length}, ${CELL_PX}px)` }}
      >
        {localIndices.map((i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStep(i);
            }}
            className={`h-4 border-t border-github-border/40 ${
              (clip.start + i) % stepsPerBar === 0
                ? "border-l-2 border-l-accent-pink"
                : "border-l border-github-border/30"
            } ${clip.steps[i]?.active ? "bg-accent-cyan" : "bg-transparent"}`}
            title={`Step ${i + 1}`}
          />)
        )}
      </div>
    </div>
  );
}
