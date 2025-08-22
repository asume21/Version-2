import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Square, Download, Share, Volume2, Loader2, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { beatAPI } from "@/lib/api";
import { audioManager } from "@/lib/audio";
import { Waveform } from "@/components/ui/waveform";
import { AudioVisualizer } from "@/components/ui/audio-visualizer";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";
import Sequencer from "@/components/sequencer/Sequencer";

const GENRES = [
  "Hip-Hop", "Electronic", "Pop", "Rock", "R&B", "Trap", "House", "Techno",
  "Dubstep", "Drum & Bass", "Jazz", "Funk", "Reggae", "Latin"
];

const DRUM_SAMPLES = [
  "Kick", "Snare", "Hi-Hat", "Open Hat", "Crash", "Ride", "Tom", "Clap"
];

export default function BeatStudio() {
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState([120]);
  const [duration, setDuration] = useState([16]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedBeat, setGeneratedBeat] = useState<any>(null);
  const [beatPattern, setBeatPattern] = useState<number[]>([]);
  const [selectedSample, setSelectedSample] = useState("Kick");
  const [volume, setVolume] = useState([75]);
  const [aiProvider, setAiProvider] = useState<"grok" | "openai" | "gemini">("grok");
  const [audioInitialized, setAudioInitialized] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  const generateMutation = useMutation({
    mutationFn: beatAPI.generate,
    onSuccess: (data) => {
      setGeneratedBeat(data);
      setBeatPattern(data.pattern);
      toast({
        title: "Beat generated!",
        description: `Created a ${genre} beat at ${bpm[0]} BPM`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!genre) {
      toast({
        title: "No genre selected",
        description: "Please select a genre for your beat",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      genre,
      bpm: bpm[0],
      duration: duration[0],
      aiProvider: aiProvider
    });
  };

  const handleInitializeAudio = async () => {
    try {
      await audioManager.initialize();
      setAudioInitialized(true);
      toast({
        title: "Audio ready",
        description: "Audio system initialized successfully",
      });
    } catch (error) {
      toast({
        title: "Audio initialization failed",
        description: "Please check your browser audio settings",
        variant: "destructive",
      });
    }
  };

  const handlePlay = async () => {
    try {
      if (!audioInitialized) {
        await audioManager.initialize();
        setAudioInitialized(true);
        toast({ title: "Audio ready", description: "Audio system initialized" });
      }

      const patternToPlay = generatedBeat?.pattern?.length
        ? generatedBeat.pattern
        : (beatPattern?.length ? beatPattern : null);

      if (!patternToPlay) {
        toast({
          title: "No pattern to play",
          description: "Generate a beat or edit the pattern to add steps",
          variant: "destructive",
        });
        return;
      }

      if (isPlaying) {
        audioManager.stop();
        setIsPlaying(false);
        return;
      }

      await audioManager.playBeat(
        patternToPlay,
        generatedBeat?.samples || ["kick", "snare", "hihat"],
        bpm[0]
      );
      setIsPlaying(true);
      toast({ title: "Playing beat", description: generatedBeat?.description || "Beat is now playing" });
    } catch (error) {
      console.error("Playback error:", error);
      toast({
        title: "Playback failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const handlePatternClick = (index: number) => {
    const newPattern = [...beatPattern];
    newPattern[index] = newPattern[index] ? 0 : 1;
    setBeatPattern(newPattern);
    if (generatedBeat) {
      setGeneratedBeat({ ...generatedBeat, pattern: newPattern });
    }
  };

  const clearPattern = () => {
    setBeatPattern(Array(16).fill(0));
    if (generatedBeat) {
      setGeneratedBeat({ ...generatedBeat, pattern: Array(16).fill(0) });
    }
  };

  const randomizePattern = () => {
    const newPattern = Array(16).fill(0).map(() => Math.random() > 0.6 ? 1 : 0);
    setBeatPattern(newPattern);
    if (generatedBeat) {
      setGeneratedBeat({ ...generatedBeat, pattern: newPattern });
    }
  };

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center mr-4">
                <Music className="text-accent-cyan h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Beat Studio</h1>
                <p className="text-github-text-secondary">
                  Create and edit professional beats with AI assistance
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">AI-Generated</Badge>
              <Badge variant="secondary">Real-time Editing</Badge>
              <Badge variant="secondary">Multiple Genres</Badge>
            </div>
          </div>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="generate">Generate Beat</TabsTrigger>
              <TabsTrigger value="edit">Edit Pattern</TabsTrigger>
              <TabsTrigger value="sequencer">Sequencer</TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              {/* Beat Parameters */}
              <Card className="bg-github-secondary border-github-border mb-6">
                <CardHeader>
                  <CardTitle>Beat Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Genre</label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className="bg-github-dark border-github-border">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        BPM: {bpm[0]}
                      </label>
                      <Slider
                        value={bpm}
                        onValueChange={setBpm}
                        max={200}
                        min={60}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Duration: {duration[0]} bars
                      </label>
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        max={32}
                        min={4}
                        step={4}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">AI Provider</label>
                      <AIProviderSelector
                        value={aiProvider}
                        onValueChange={(v) => setAiProvider(v as "grok" | "openai" | "gemini")}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Beat...
                      </>
                    ) : (
                      <>
                        <Music className="mr-2 h-4 w-4" />
                        Generate Beat
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Beat Preview */}
              {generatedBeat && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-github-secondary border-github-border">
                    <CardHeader>
                      <CardTitle>Beat Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <AudioVisualizer 
                          isPlaying={isPlaying}
                          className="h-32"
                        />
                        
                        {/* Audio Initialization */}
                        {!audioInitialized && (
                          <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-accent-purple">Audio Setup Required</h4>
                                <p className="text-sm text-github-text-secondary">Click to enable audio playback</p>
                              </div>
                              <Button
                                onClick={handleInitializeAudio}
                                className="bg-accent-purple hover:bg-accent-purple/80"
                              >
                                <Volume2 className="mr-2 h-4 w-4" />
                                Start Audio
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={handlePlay}
                              disabled={!audioInitialized}
                              className="w-12 h-12 rounded-full bg-accent-cyan/20 hover:bg-accent-cyan/30 disabled:opacity-50"
                            >
                              {isPlaying ? (
                                <Pause className="h-5 w-5 text-accent-cyan" />
                              ) : (
                                <Play className="h-5 w-5 text-accent-cyan" />
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                audioManager.stop();
                                setIsPlaying(false);
                              }}
                              variant="outline"
                              size="sm"
                              disabled={!audioInitialized}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4 text-github-text-secondary" />
                            <Slider
                              value={volume}
                              onValueChange={setVolume}
                              max={100}
                              min={0}
                              className="w-20"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-github-secondary border-github-border">
                    <CardHeader>
                      <CardTitle>Beat Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Samples Used</h3>
                          <div className="flex flex-wrap gap-2">
                            {generatedBeat.samples.map((sample: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {sample}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Pattern</h3>
                          <div className="grid grid-cols-8 gap-1">
                            {generatedBeat.pattern.slice(0, 16).map((beat: number, index: number) => (
                              <div
                                key={index}
                                className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
                                  beat ? 'bg-accent-cyan border-accent-cyan text-github-dark' : 'border-github-border'
                                }`}
                              >
                                {index + 1}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Description</h3>
                          <p className="text-github-text-secondary text-sm">
                            {generatedBeat.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pattern Editor */}
                <div className="lg:col-span-2">
                  <Card className="bg-github-secondary border-github-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Pattern Editor</CardTitle>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={clearPattern}>
                            Clear
                          </Button>
                          <Button size="sm" variant="outline" onClick={randomizePattern}>
                            Random
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {DRUM_SAMPLES.map((sample, sampleIndex) => (
                          <div key={sample} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{sample}</span>
                              <Button
                                size="sm"
                                variant={selectedSample === sample ? "default" : "outline"}
                                onClick={() => setSelectedSample(sample)}
                                className="text-xs"
                              >
                                Select
                              </Button>
                            </div>
                            <div className="grid grid-cols-16 gap-1">
                              {Array(16).fill(0).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => handlePatternClick(index)}
                                  className={`w-6 h-6 rounded border-2 transition-colors ${
                                    beatPattern[index] && selectedSample === sample
                                      ? 'bg-accent-cyan border-accent-cyan'
                                      : 'border-github-border hover:border-accent-cyan/50'
                                  } ${index % 4 === 0 ? 'border-l-4 border-l-accent-pink' : ''}`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <Card className="bg-github-secondary border-github-border">
                    <CardHeader>
                      <CardTitle className="text-sm">Playback Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex space-x-2">
                          <Button
                            onClick={handlePlay}
                            className="flex-1 bg-accent-cyan/20 hover:bg-accent-cyan/30"
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            onClick={() => {
                              audioManager.stop();
                              setIsPlaying(false);
                            }}
                            variant="outline"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <label className="text-xs font-medium">Volume</label>
                          <Slider
                            value={volume}
                            onValueChange={setVolume}
                            max={100}
                            min={0}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-github-secondary border-github-border">
                    <CardHeader>
                      <CardTitle className="text-sm">Sample Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {DRUM_SAMPLES.map((sample) => (
                          <Button
                            key={sample}
                            size="sm"
                            variant={selectedSample === sample ? "default" : "outline"}
                            onClick={() => setSelectedSample(sample)}
                            className="w-full justify-start text-xs"
                          >
                            {sample}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-accent-cyan/10 border-accent-cyan/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-accent-cyan">💡 Beat Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs">
                        <li>• Click grid squares to toggle beats</li>
                        <li>• Use kick on 1 and 3 for foundation</li>
                        <li>• Add snare on 2 and 4 for rhythm</li>
                        <li>• Fill with hi-hats for texture</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sequencer">
              <div className="grid grid-cols-1 gap-6">
                <Sequencer />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
