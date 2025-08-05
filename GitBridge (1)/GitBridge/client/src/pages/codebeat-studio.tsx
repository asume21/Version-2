import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Code, 
  Music, 
  Play, 
  Pause, 
  ArrowRight,
  Download,
  Share,
  Loader2,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { codeBeatAPI } from "@/lib/api";
import { audioManager } from "@/lib/audio";
import { CodeEditor } from "@/components/ui/code-editor";
import { Waveform } from "@/components/ui/waveform";
import { AudioVisualizer } from "@/components/ui/audio-visualizer";
import { Slider } from "@/components/ui/slider";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";

const PROGRAMMING_LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", 
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala"
];

const MUSICAL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function CodeBeatStudio() {
  const [sourceCode, setSourceCode] = useState("");
  const [language, setLanguage] = useState("");
  const [musicResult, setMusicResult] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [aiProvider, setAiProvider] = useState("grok");
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: codeBeatAPI.convert,
    onSuccess: (data) => {
      setMusicResult(data);
      toast({
        title: "Code converted to music!",
        description: `Created a musical composition in ${data.key} at ${data.tempo} BPM`,
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConvert = () => {
    if (!sourceCode.trim()) {
      toast({
        title: "No code provided",
        description: "Please enter some code to convert",
        variant: "destructive",
      });
      return;
    }

    if (!language) {
      toast({
        title: "No language selected",
        description: "Please select the programming language",
        variant: "destructive",
      });
      return;
    }

    convertMutation.mutate({
      code: sourceCode,
      language,
      aiProvider
    });
  };

  const handlePlay = async () => {
    if (!musicResult) return;

    if (isPlaying) {
      audioManager.stop();
      setIsPlaying(false);
    } else {
      try {
        await audioManager.playMelody(musicResult.melody, musicResult.tempo);
        setIsPlaying(true);
        
        // Auto-stop after melody completes
        setTimeout(() => {
          setIsPlaying(false);
        }, (musicResult.melody.length * (60 / musicResult.tempo) * 0.5) * 1000);
      } catch (error) {
        toast({
          title: "Playback failed",
          description: "Could not play the generated music",
          variant: "destructive",
        });
      }
    }
  };

  const exampleCodes = {
    JavaScript: `function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// Recursive pattern creates ascending melody
// Loop structure adds rhythmic complexity`,

    Python: `import random

def generate_pattern(size):
    pattern = []
    for i in range(size):
        if i % 2 == 0:
            pattern.append(random.choice([1, 2, 3]))
        else:
            pattern.append(0)
    return pattern

# Conditional logic creates syncopated rhythm
# Random elements add harmonic variation`,

    Java: `public class MelodyGenerator {
    private int[] notes = {60, 62, 64, 65, 67, 69, 71, 72};
    
    public void playScale() {
        for (int note : notes) {
            System.out.println("Playing note: " + note);
            Thread.sleep(250);
        }
    }
}

// Object structure maps to chord progressions
// Array iteration creates melodic sequences`
  };

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const getMIDINoteName = (midiNote: number) => {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${noteNames[noteIndex]}${octave}`;
  };

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-cyan via-accent-purple to-accent-pink rounded-lg flex items-center justify-center mr-4">
                <Zap className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Code<span className="text-accent-cyan">Beat</span> Studio
                </h1>
                <p className="text-github-text-secondary">
                  Transform your code into musical compositions with AI magic
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Revolutionary</Badge>
              <Badge variant="secondary">Code Analysis</Badge>
              <Badge variant="secondary">Musical Mapping</Badge>
              <Badge variant="secondary">AI-Powered</Badge>
            </div>
          </div>

          {/* Conversion Interface */}
          <Card className="bg-github-secondary border-github-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-accent-purple" />
                Code Input
                <ArrowRight className="mx-4 h-5 w-5 text-accent-cyan" />
                <Music className="mr-2 h-5 w-5 text-accent-pink" />
                Music Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Code Input */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Programming Language</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-github-dark border-github-border">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROGRAMMING_LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">AI Provider</label>
                      <AIProviderSelector
                        value={aiProvider}
                        onValueChange={setAiProvider}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Source Code</label>
                    <Textarea
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                      placeholder="Enter your code here..."
                      className="min-h-64 font-mono bg-github-dark border-github-border resize-none"
                    />
                  </div>

                  {language && exampleCodes[language as keyof typeof exampleCodes] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSourceCode(exampleCodes[language as keyof typeof exampleCodes])}
                    >
                      Load Example Code
                    </Button>
                  )}
                </div>

                {/* Music Output */}
                <div className="space-y-4">
                  {musicResult ? (
                    <>
                      <div className="space-y-4">
                        <Card className="bg-github-dark border-github-border">
                          <CardContent className="p-4">
                            <AudioVisualizer 
                              isPlaying={isPlaying}
                              className="h-32 mb-4"
                            />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Button
                                  onClick={handlePlay}
                                  className="w-12 h-12 rounded-full bg-accent-pink/20 hover:bg-accent-pink/30"
                                >
                                  {isPlaying ? (
                                    <Pause className="h-5 w-5 text-accent-pink" />
                                  ) : (
                                    <Play className="h-5 w-5 text-accent-pink" />
                                  )}
                                </Button>
                                <div className="text-sm">
                                  <div className="text-white">Generated Composition</div>
                                  <div className="text-github-text-secondary text-xs">
                                    {musicResult.tempo} BPM • {musicResult.key}
                                  </div>
                                </div>
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
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                          <Card className="bg-github-dark border-github-border">
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-2 text-accent-cyan">Musical Key</h3>
                              <Badge variant="outline" className="text-accent-cyan">
                                {musicResult.key}
                              </Badge>
                            </CardContent>
                          </Card>

                          <Card className="bg-github-dark border-github-border">
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-2 text-accent-pink">Tempo</h3>
                              <Badge variant="outline" className="text-accent-pink">
                                {musicResult.tempo} BPM
                              </Badge>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="bg-github-dark border-github-border">
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">Melody Pattern</h3>
                            <div className="grid grid-cols-8 gap-1">
                              {musicResult.melody.slice(0, 16).map((note: number, index: number) => (
                                <div
                                  key={index}
                                  className="p-2 bg-accent-purple/20 rounded text-center text-xs font-mono"
                                  title={`MIDI Note ${note}`}
                                >
                                  {getMIDINoteName(note)}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                          <Card className="bg-github-dark border-github-border">
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-2">Rhythm Pattern</h3>
                              <div className="grid grid-cols-16 gap-1">
                                {musicResult.rhythm.slice(0, 16).map((beat: number, index: number) => (
                                  <div
                                    key={index}
                                    className={`w-4 h-4 rounded ${
                                      beat ? 'bg-accent-cyan' : 'bg-github-border'
                                    }`}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export MIDI
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="min-h-64 bg-github-dark border border-github-border rounded-lg flex items-center justify-center text-github-text-secondary">
                        Your musical composition will appear here
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleConvert}
              disabled={convertMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink text-white font-semibold"
              size="lg"
            >
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Converting Code to Music...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Transform Code to Music
                </>
              )}
            </Button>
          </div>

          {/* Explanation */}
          {musicResult && (
            <Card className="bg-github-secondary border-github-border mb-6">
              <CardHeader>
                <CardTitle>Conversion Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-github-text-secondary">{musicResult.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          <Card className="bg-accent-cyan/10 border-accent-cyan/20">
            <CardHeader>
              <CardTitle className="text-accent-cyan">🎵 How CodeBeat Fusion Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h3 className="font-medium mb-2 text-accent-purple">1. Code Analysis</h3>
                  <ul className="space-y-1 text-xs">
                    <li>• Analyzes code structure and complexity</li>
                    <li>• Identifies patterns and loops</li>
                    <li>• Maps function calls to melodic phrases</li>
                    <li>• Converts variables to harmonic elements</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-accent-pink">2. Musical Mapping</h3>
                  <ul className="space-y-1 text-xs">
                    <li>• Conditional statements → chord changes</li>
                    <li>• Loops → repeating musical patterns</li>
                    <li>• Function depth → musical octaves</li>
                    <li>• Code complexity → rhythmic density</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-accent-cyan">3. Composition</h3>
                  <ul className="space-y-1 text-xs">
                    <li>• Generates MIDI note sequences</li>
                    <li>• Creates rhythmic patterns</li>
                    <li>• Assigns appropriate tempo and key</li>
                    <li>• Produces playable musical output</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
