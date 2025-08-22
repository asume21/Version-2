import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, Music, Sparkles, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { lyricsAPI } from "@/lib/api";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";

const MUSIC_GENRES = [
  "Hip-Hop", "Pop", "Rock", "R&B", "Country", "Jazz", "Blues", "Folk", 
  "Electronic", "Rap", "Alternative", "Indie", "Classical", "Reggae"
];

const MOODS = [
  "Happy", "Sad", "Energetic", "Romantic", "Angry", "Peaceful", "Mysterious", 
  "Nostalgic", "Hopeful", "Melancholic", "Confident", "Dreamy"
];

export default function LyricLab() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [rhymeScheme, setRhymeScheme] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [analysisLyrics, setAnalysisLyrics] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [aiProvider, setAiProvider] = useState("grok");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: lyricsAPI.generate,
    onSuccess: (data) => {
      setGeneratedLyrics(data.lyrics);
      setRhymeScheme(data.rhymeScheme);
      setSentiment(data.sentiment);
      toast({
        title: "Lyrics generated!",
        description: "Your AI-powered lyrics are ready",
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

  const analyzeMutation = useMutation({
    mutationFn: lyricsAPI.analyze,
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Analysis complete!",
        description: "Lyric analysis results are ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a topic or theme for your lyrics",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      prompt,
      genre: genre || undefined,
      mood: mood || undefined,
      aiProvider
    });
  };

  const handleAnalyze = () => {
    if (!analysisLyrics.trim()) {
      toast({
        title: "No lyrics provided",
        description: "Please enter some lyrics to analyze",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      lyrics: analysisLyrics,
      aiProvider
    });
  };

  const examplePrompts = [
    "A song about overcoming challenges in coding",
    "Love story between two developers",
    "The frustration of debugging late at night",
    "Celebrating a successful product launch",
    "The journey of learning a new programming language"
  ];

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-pink/20 rounded-lg flex items-center justify-center mr-4">
                <FileText className="text-accent-pink h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Lyric Lab</h1>
                <p className="text-github-text-secondary">
                  Generate creative song lyrics and analyze their patterns with AI
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">AI-Generated</Badge>
              <Badge variant="secondary">Multiple Genres</Badge>
              <Badge variant="secondary">Rhyme Analysis</Badge>
            </div>
          </div>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="generate" className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Lyrics
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Lyrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              {/* Generation Parameters */}
              <Card className="bg-github-secondary border-github-border mb-6">
                <CardHeader>
                  <CardTitle>Generation Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Topic/Theme</label>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="What should the song be about?"
                      className="bg-white text-black placeholder:text-gray-500 border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Genre (Optional)</label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className="bg-github-dark border-github-border">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {MUSIC_GENRES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Mood (Optional)</label>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="bg-github-dark border-github-border">
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
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
                    <label className="text-sm font-medium mb-2 block">Example Prompts</label>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((example, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => setPrompt(example)}
                          className="text-xs"
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full bg-gradient-to-r from-accent-pink to-accent-purple"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Lyrics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Lyrics
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Lyrics */}
              {generatedLyrics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="bg-github-secondary border-github-border">
                      <CardHeader>
                        <CardTitle>Generated Lyrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={generatedLyrics}
                          onChange={(e) => setGeneratedLyrics(e.target.value)}
                          className="min-h-96 bg-white text-black placeholder:text-gray-500 border-gray-300 resize-none font-mono"
                          placeholder="Your generated lyrics will appear here..."
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-github-secondary border-github-border">
                      <CardHeader>
                        <CardTitle className="text-sm">Rhyme Scheme</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="text-accent-cyan">
                          {rhymeScheme}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card className="bg-github-secondary border-github-border">
                      <CardHeader>
                        <CardTitle className="text-sm">Sentiment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge 
                          variant="outline" 
                          className={
                            sentiment.toLowerCase().includes('positive') ? 'text-green-500' :
                            sentiment.toLowerCase().includes('negative') ? 'text-red-500' :
                            'text-yellow-500'
                          }
                        >
                          {sentiment}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card className="bg-accent-pink/10 border-accent-pink/20">
                      <CardHeader>
                        <CardTitle className="text-sm text-accent-pink">💡 Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-xs">
                          <li>• Edit generated lyrics to match your style</li>
                          <li>• Try different genres for variety</li>
                          <li>• Use specific prompts for better results</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyze">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analysis Input */}
                <Card className="bg-github-secondary border-github-border">
                  <CardHeader>
                    <CardTitle>Lyrics to Analyze</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={analysisLyrics}
                      onChange={(e) => setAnalysisLyrics(e.target.value)}
                      placeholder="Paste your lyrics here for analysis..."
                      className="min-h-64 bg-white text-black placeholder:text-gray-500 border-gray-300 resize-none"
                    />
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending}
                      className="w-full mt-4 bg-gradient-to-r from-accent-cyan to-accent-purple"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analyze Lyrics
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                <div className="space-y-4">
                  {analysis ? (
                    <>
                      <Card className="bg-github-secondary border-github-border">
                        <CardHeader>
                          <CardTitle className="text-sm">Sentiment Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge 
                            variant="outline" 
                            className={
                              analysis.sentiment.toLowerCase().includes('positive') ? 'text-green-500' :
                              analysis.sentiment.toLowerCase().includes('negative') ? 'text-red-500' :
                              'text-yellow-500'
                            }
                          >
                            {analysis.sentiment}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card className="bg-github-secondary border-github-border">
                        <CardHeader>
                          <CardTitle className="text-sm">Themes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysis.themes.map((theme: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-github-secondary border-github-border">
                        <CardHeader>
                          <CardTitle className="text-sm">Rhyme Scheme</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline" className="text-accent-cyan">
                            {analysis.rhymeScheme}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card className="bg-github-secondary border-github-border">
                        <CardHeader>
                          <CardTitle className="text-sm">Complexity Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-github-dark rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-accent-purple to-accent-pink h-2 rounded-full"
                                style={{ width: `${(analysis.complexity / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{analysis.complexity}/10</span>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className="bg-github-secondary border-github-border">
                      <CardContent className="p-8 text-center text-github-text-secondary">
                        Analysis results will appear here
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
