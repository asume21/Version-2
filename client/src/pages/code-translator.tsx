import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Copy, Download, Share, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { codeAPI } from "@/lib/api";
import { CodeEditor } from "@/components/ui/code-editor";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";

const PROGRAMMING_LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", 
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB"
];

export default function CodeTranslator() {
  const [sourceCode, setSourceCode] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [aiProvider, setAiProvider] = useState("grok");
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: codeAPI.translate,
    onSuccess: (data) => {
      setTranslatedCode(data.translatedCode);
      setExplanation(data.explanation);
      toast({
        title: "Translation complete!",
        description: `Successfully translated from ${sourceLanguage} to ${targetLanguage}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTranslate = () => {
    if (!sourceCode.trim()) {
      toast({
        title: "No code provided",
        description: "Please enter some code to translate",
        variant: "destructive",
      });
      return;
    }

    if (!sourceLanguage || !targetLanguage) {
      toast({
        title: "Languages not selected",
        description: "Please select both source and target languages",
        variant: "destructive",
      });
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "Same language selected",
        description: "Source and target languages cannot be the same",
        variant: "destructive",
      });
      return;
    }

    translateMutation.mutate({
      sourceCode,
      sourceLanguage,
      targetLanguage,
      aiProvider
    });
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: "The code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const exampleCodes = {
    JavaScript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    Python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    Java: `public static int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
  };

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mr-4">
                <Code className="text-accent-purple h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Code Translator</h1>
                <p className="text-github-text-secondary">
                  Transform code between programming languages with AI precision
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">50+ Languages</Badge>
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="secondary">Context-Aware</Badge>
            </div>
          </div>

          {/* AI Provider and Language Selection */}
          <Card className="bg-github-secondary border-github-border mb-6">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">AI Provider</label>
                <AIProviderSelector 
                  value={aiProvider} 
                  onValueChange={setAiProvider}
                  className="mb-4"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source Language</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source language" />
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

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-accent-cyan" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Language</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
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
              </div>
            </CardContent>
          </Card>

          {/* Code Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Source Code */}
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Source Code</CardTitle>
                  {sourceLanguage && (
                    <div className="flex gap-2">
                      {Object.keys(exampleCodes).includes(sourceLanguage) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSourceCode(exampleCodes[sourceLanguage as keyof typeof exampleCodes])}
                        >
                          Load Example
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  placeholder="Enter your code here..."
                  className="min-h-64 font-mono bg-github-dark border-github-border resize-none"
                />
              </CardContent>
            </Card>

            {/* Translated Code */}
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Translated Code</CardTitle>
                  {translatedCode && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(translatedCode)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {translatedCode ? (
                  <CodeEditor
                    code={translatedCode}
                    language={targetLanguage?.toLowerCase() || "text"}
                    readOnly
                    className="min-h-64"
                  />
                ) : (
                  <div className="min-h-64 bg-github-dark border border-github-border rounded-lg flex items-center justify-center text-github-text-secondary">
                    Translated code will appear here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Translation Button */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleTranslate}
              disabled={translateMutation.isPending}
              className="px-8 py-3 bg-gradient-purple-pink text-white font-semibold"
              size="lg"
            >
              {translateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-5 w-5" />
                  Translate Code
                </>
              )}
            </Button>
          </div>

          {/* Explanation */}
          {explanation && (
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle>Translation Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-github-text-secondary">{explanation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-accent-purple/10 border-accent-purple/20 mt-6">
            <CardHeader>
              <CardTitle className="text-accent-purple">💡 Translation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Provide complete, well-structured code for best results</li>
                <li>• Include comments to help the AI understand context</li>
                <li>• Review translated code for language-specific optimizations</li>
                <li>• Consider testing the translated code in your target environment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
