import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";
import { useToast } from "@/hooks/use-toast";
import { proAudioAPI, ProAudioOptions } from "@/lib/api";
import { Headphones, Loader2, Music } from "lucide-react";

const MUSIC_GENRES = [
  "Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Blues", "Country", "R&B", "Classical", "Indie"
];

const MOODS = [
  "Uplifting", "Energetic", "Dreamy", "Melancholic", "Dark", "Happy", "Sad", "Romantic", "Epic"
];

const KEYS = [
  "C Major", "G Major", "D Major", "A Major", "E Major", "F Major", "B Major",
  "A Minor", "E Minor", "B Minor", "F# Minor", "D Minor"
];

const COMMON_INSTRUMENTS = ["piano", "guitar", "bass", "drums", "synth", "strings", "pads", "brass"];

const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function ProAudioPage() {
  const [prompt, setPrompt] = useState("");
  const [aiProvider, setAiProvider] = useState("grok");

  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [duration, setDuration] = useState<number>(180);
  const [style, setStyle] = useState("");
  const [instruments, setInstruments] = useState<Set<string>>(new Set(["piano", "guitar", "bass", "drums"]));
  const [vocals, setVocals] = useState<boolean>(true);
  const [bpm, setBpm] = useState<number>(120);
  const [key, setKey] = useState<string>("C Major");

  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: proAudioAPI.generate,
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "Pro Audio generated!", description: "Studio-level composition is ready." });
    },
    onError: (error: any) => {
      toast({ title: "Generation failed", description: error.message || String(error), variant: "destructive" });
    }
  });

  const handleInstrumentToggle = (name: string, checked: boolean) => {
    setInstruments(prev => {
      const next = new Set(prev);
      if (checked) next.add(name); else next.delete(name);
      return next;
    });
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "No prompt provided", description: "Please describe the song you want to generate.", variant: "destructive" });
      return;
    }

    const options: ProAudioOptions = {
      genre: genre || undefined,
      mood: mood || undefined,
      duration,
      style: style || undefined,
      instruments: Array.from(instruments),
      vocals,
      bpm,
      key
    };

    // Server defaults to Grok; no need to send aiProvider explicitly
    generateMutation.mutate({ prompt, options });
  };

  const examplePrompts = [
    "An uplifting pop anthem about conquering challenges",
    "A moody synthwave track for late-night coding",
    "Energetic rock song with powerful chorus and catchy riff",
  ];

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mr-4">
                <Headphones className="text-accent-purple h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Pro Audio</h1>
                <p className="text-github-text-secondary">Generate studio-quality songs using the Grok provider</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Studio-Grade</Badge>
              <Badge variant="secondary">Grok Only</Badge>
              <Badge variant="secondary">Up to 8 minutes</Badge>
            </div>
          </div>

          {/* Parameters */}
          <Card className="bg-github-secondary border-github-border mb-6">
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Song Description</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the song (theme, vibe, references, etc.)"
                  className="min-h-32 bg-white text-black placeholder:text-gray-500 border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-github-dark border-github-border">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSIC_GENRES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="bg-github-dark border-github-border">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">AI Provider</label>
                  <AIProviderSelector value={aiProvider} onValueChange={setAiProvider} allowedIds={["grok"]} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration ({formatSeconds(duration)})</label>
                  <Slider
                    value={[duration]}
                    min={30}
                    max={480}
                    step={5}
                    onValueChange={(v) => setDuration(v[0])}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">BPM ({bpm})</label>
                  <Slider
                    value={[bpm]}
                    min={60}
                    max={200}
                    step={1}
                    onValueChange={(v) => setBpm(v[0])}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Key</label>
                  <Select value={key} onValueChange={setKey}>
                    <SelectTrigger className="bg-github-dark border-github-border">
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                    <SelectContent>
                      {KEYS.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Style (Optional)</label>
                  <Input
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="e.g., modern, vintage, lo-fi"
                    className="bg-white text-black placeholder:text-gray-500 border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Vocals</label>
                  <div className="flex items-center space-x-3">
                    <Switch checked={vocals} onCheckedChange={setVocals} />
                    <span className="text-sm text-github-text-secondary">Include lead vocals</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Instruments</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {COMMON_INSTRUMENTS.map((inst) => (
                    <label key={inst} className="flex items-center space-x-2 p-2 rounded-md bg-github-dark border border-github-border">
                      <Checkbox
                        checked={instruments.has(inst)}
                        onCheckedChange={(c) => handleInstrumentToggle(inst, Boolean(c))}
                      />
                      <span className="text-sm capitalize">{inst}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Example Prompts</label>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((ex, i) => (
                    <Button key={i} size="sm" variant="outline" className="text-xs" onClick={() => setPrompt(ex)}>
                      {ex}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-accent-purple to-accent-pink"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Generate Professional Song
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle>Song Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap bg-github-dark p-3 rounded border border-github-border">{JSON.stringify(result.songStructure || result.structure || {}, null, 2)}</pre>
                  </CardContent>
                </Card>

                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle>Lyrics (if generated)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap bg-github-dark p-3 rounded border border-github-border">{JSON.stringify(result.lyrics || result.vocals || {}, null, 2)}</pre>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Chord Progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(result.chordProgression || []).map((ch: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{ch}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs space-y-1">
                      <div>Duration: {result?.metadata?.duration ? formatSeconds(result.metadata.duration) : "-"}</div>
                      <div>Key: {result?.metadata?.key || key}</div>
                      <div>BPM: {result?.metadata?.bpm || bpm}</div>
                      <div>Format: {result?.metadata?.format || "WAV"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Production Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap bg-github-dark p-3 rounded border border-github-border">{JSON.stringify(result.productionNotes || {}, null, 2)}</pre>
                  </CardContent>
                </Card>

                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Audio Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap bg-github-dark p-3 rounded border border-github-border">{JSON.stringify(result.audioFeatures || result.audioQuality || {}, null, 2)}</pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
