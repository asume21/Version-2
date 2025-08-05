import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Music, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Save, 
  Volume2, 
  Plus,
  Minus,
  FileText,
  Headphones,
  Mic
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { lyricsAPI, beatAPI } from "@/lib/api";
import { audioManager } from "@/lib/audio";
import { Waveform } from "@/components/ui/waveform";
import { AudioVisualizer } from "@/components/ui/audio-visualizer";

interface Track {
  id: string;
  name: string;
  type: 'melody' | 'beat' | 'lyrics' | 'vocals';
  content: any;
  volume: number;
  muted: boolean;
  solo: boolean;
}

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = ['Major', 'Minor', 'Dorian', 'Mixolydian', 'Pentatonic'];

export default function MusicStudio() {
  const [projectName, setProjectName] = useState("Untitled Song");
  const [key, setKey] = useState("C");
  const [scale, setScale] = useState("Major");
  const [tempo, setTempo] = useState([120]);
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      name: 'Main Melody',
      type: 'melody',
      content: null,
      volume: 75,
      muted: false,
      solo: false
    },
    {
      id: '2',
      name: 'Beat',
      type: 'beat',
      content: null,
      volume: 80,
      muted: false,
      solo: false
    },
    {
      id: '3',
      name: 'Lyrics',
      type: 'lyrics',
      content: '',
      volume: 70,
      muted: false,
      solo: false
    }
  ]);
  const [selectedTrack, setSelectedTrack] = useState('1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState("");
  const [beatGenre, setBeatGenre] = useState("");
  const { toast } = useToast();

  const generateLyricsMutation = useMutation({
    mutationFn: lyricsAPI.generate,
    onSuccess: (data) => {
      updateTrackContent('3', data.lyrics);
      toast({
        title: "Lyrics generated!",
        description: "AI-powered lyrics have been added to your track",
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

  const generateBeatMutation = useMutation({
    mutationFn: beatAPI.generate,
    onSuccess: (data) => {
      updateTrackContent('2', data);
      toast({
        title: "Beat generated!",
        description: "A new beat has been added to your track",
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

  const updateTrackContent = (trackId: string, content: any) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, content } : track
    ));
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const toggleMute = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const addTrack = (type: Track['type']) => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${tracks.length + 1}`,
      type,
      content: type === 'lyrics' ? '' : null,
      volume: 75,
      muted: false,
      solo: false
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (trackId: string) => {
    setTracks(tracks.filter(track => track.id !== trackId));
  };

  const handlePlay = async () => {
    if (isPlaying) {
      audioManager.stop();
      setIsPlaying(false);
    } else {
      // Play the beat track if available
      const beatTrack = tracks.find(t => t.type === 'beat' && t.content && !t.muted);
      if (beatTrack?.content) {
        try {
          await audioManager.playBeat(beatTrack.content.pattern, beatTrack.content.samples, tempo[0]);
          setIsPlaying(true);
        } catch (error) {
          toast({
            title: "Playback failed",
            description: "Could not play the composition",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "No playable content",
          description: "Add a beat track to play your composition",
          variant: "destructive",
        });
      }
    }
  };

  const generateLyrics = () => {
    if (!lyricsPrompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a topic for your lyrics",
        variant: "destructive",
      });
      return;
    }

    generateLyricsMutation.mutate({
      prompt: lyricsPrompt,
    });
  };

  const generateBeat = () => {
    if (!beatGenre) {
      toast({
        title: "No genre selected",
        description: "Please select a genre for your beat",
        variant: "destructive",
      });
      return;
    }

    generateBeatMutation.mutate({
      genre: beatGenre,
      bpm: tempo[0],
      duration: 16,
    });
  };

  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent-pink/20 rounded-lg flex items-center justify-center mr-4">
                  <Music className="text-accent-pink h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Music Studio</h1>
                  <p className="text-github-text-secondary">
                    Compose complete songs with AI collaboration
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save Project
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Multi-track</Badge>
              <Badge variant="secondary">AI Collaboration</Badge>
              <Badge variant="secondary">Real-time Mixing</Badge>
            </div>
          </div>

          {/* Project Settings */}
          <Card className="bg-github-secondary border-github-border mb-6">
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Name</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-github-dark border-github-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Key</label>
                  <Select value={key} onValueChange={setKey}>
                    <SelectTrigger className="bg-github-dark border-github-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEYS.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Scale</label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger className="bg-github-dark border-github-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tempo: {tempo[0]} BPM
                  </label>
                  <Slider
                    value={tempo}
                    onValueChange={setTempo}
                    max={200}
                    min={60}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Track Mixer */}
            <div className="lg:col-span-2">
              <Card className="bg-github-secondary border-github-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Track Mixer</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handlePlay}
                        className="bg-accent-pink/20 hover:bg-accent-pink/30"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={() => {
                          audioManager.stop();
                          setIsPlaying(false);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          selectedTrack === track.id 
                            ? 'border-accent-pink bg-accent-pink/10' 
                            : 'border-github-border bg-github-dark'
                        }`}
                        onClick={() => setSelectedTrack(track.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              track.type === 'melody' ? 'bg-accent-purple/20' :
                              track.type === 'beat' ? 'bg-accent-cyan/20' :
                              track.type === 'lyrics' ? 'bg-accent-pink/20' :
                              'bg-accent-purple/20'
                            }`}>
                              {track.type === 'melody' && <Music className="h-4 w-4" />}
                              {track.type === 'beat' && <Headphones className="h-4 w-4" />}
                              {track.type === 'lyrics' && <FileText className="h-4 w-4" />}
                              {track.type === 'vocals' && <Mic className="h-4 w-4" />}
                            </div>
                            <span className="font-medium">{track.name}</span>
                            {track.content && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant={track.muted ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMute(track.id);
                              }}
                              className="text-xs px-2"
                            >
                              {track.muted ? "M" : "M"}
                            </Button>
                            <Button
                              size="sm"
                              variant={track.solo ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSolo(track.id);
                              }}
                              className="text-xs px-2"
                            >
                              S
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrack(track.id);
                              }}
                              className="text-xs px-2"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Volume2 className="h-4 w-4 text-github-text-secondary" />
                          <Slider
                            value={[track.volume]}
                            onValueChange={(value) => updateTrackVolume(track.id, value[0])}
                            max={100}
                            min={0}
                            className="flex-1"
                          />
                          <span className="text-sm text-github-text-secondary w-8">
                            {track.volume}
                          </span>
                        </div>

                        {track.type === 'beat' && track.content && (
                          <div className="mt-2">
                            <Waveform className="h-8" bars={16} color="cyan" />
                          </div>
                        )}
                      </div>
                    ))}

                    <Separator />

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addTrack('melody')}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Melody
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addTrack('beat')}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Beat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addTrack('lyrics')}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lyrics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Track Editor */}
            <div>
              <Card className="bg-github-secondary border-github-border">
                <CardHeader>
                  <CardTitle>
                    {selectedTrackData ? `Edit ${selectedTrackData.name}` : 'Select a Track'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTrackData ? (
                    <div className="space-y-4">
                      {selectedTrackData.type === 'lyrics' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Lyrics Prompt</label>
                            <Input
                              value={lyricsPrompt}
                              onChange={(e) => setLyricsPrompt(e.target.value)}
                              placeholder="Describe your song theme..."
                              className="bg-github-dark border-github-border"
                            />
                          </div>
                          <Button
                            onClick={generateLyrics}
                            disabled={generateLyricsMutation.isPending}
                            className="w-full bg-gradient-to-r from-accent-pink to-accent-purple"
                            size="sm"
                          >
                            Generate Lyrics
                          </Button>
                          {selectedTrackData.content && (
                            <Textarea
                              value={selectedTrackData.content}
                              onChange={(e) => updateTrackContent(selectedTrackData.id, e.target.value)}
                              className="min-h-32 bg-github-dark border-github-border resize-none text-sm"
                              placeholder="Lyrics will appear here..."
                            />
                          )}
                        </div>
                      )}

                      {selectedTrackData.type === 'beat' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Beat Genre</label>
                            <Select value={beatGenre} onValueChange={setBeatGenre}>
                              <SelectTrigger className="bg-github-dark border-github-border">
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                                <SelectItem value="Electronic">Electronic</SelectItem>
                                <SelectItem value="Pop">Pop</SelectItem>
                                <SelectItem value="Rock">Rock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={generateBeat}
                            disabled={generateBeatMutation.isPending}
                            className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                            size="sm"
                          >
                            Generate Beat
                          </Button>
                          {selectedTrackData.content && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Beat Pattern</p>
                              <div className="grid grid-cols-8 gap-1">
                                {selectedTrackData.content.pattern?.slice(0, 16).map((beat: number, index: number) => (
                                  <div
                                    key={index}
                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs ${
                                      beat ? 'bg-accent-cyan border-accent-cyan' : 'border-github-border'
                                    }`}
                                  >
                                    {beat ? '●' : '○'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedTrackData.type === 'melody' && (
                        <div className="space-y-4">
                          <p className="text-sm text-github-text-secondary">
                            Melody editing tools coming soon. Use the CodeBeat Studio to convert code into melodies.
                          </p>
                          <Button variant="outline" size="sm" className="w-full">
                            Import from CodeBeat
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-github-text-secondary text-sm">
                      Select a track from the mixer to edit its content
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
