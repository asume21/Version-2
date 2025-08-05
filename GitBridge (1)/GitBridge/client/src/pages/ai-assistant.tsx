import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Send, 
  Code, 
  Music, 
  Zap,
  MessageCircle,
  Lightbulb,
  Clock,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiAPI } from "@/lib/api";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_PROMPTS = [
  "How do I optimize this React component?",
  "Explain music theory basics for programming",
  "Help me debug this JavaScript function",
  "What's the best way to structure a music app?",
  "Convert this algorithm to a musical pattern",
  "Explain the connection between code and music"
];

const EXAMPLE_CONVERSATIONS = [
  {
    title: "React Performance",
    preview: "How to optimize React components...",
    tags: ["React", "Performance"]
  },
  {
    title: "Music Theory Basics", 
    preview: "Understanding scales and chords...",
    tags: ["Music", "Theory"]
  },
  {
    title: "Algorithm to Music",
    preview: "Converting sorting algorithms...",
    tags: ["CodeBeat", "Algorithm"]
  }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI assistant for CodedSwitch. I can help you with coding questions, music theory, beat creation, and understanding the connections between code and music. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "Help me understand music theory",
        "Debug my JavaScript code",
        "Convert code to music patterns",
        "Optimize my React components"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [context, setContext] = useState("");
  const [aiProvider, setAiProvider] = useState("grok");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const assistMutation = useMutation({
    mutationFn: aiAPI.assist,
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        suggestions: data.suggestions
      };
      setMessages(prev => [...prev, assistantMessage]);
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "AI assistance failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    assistMutation.mutate({
      question: inputValue,
      context: context || undefined,
      aiProvider
    });

    setInputValue("");
    scrollToBottom();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Message copied!",
        description: "The message has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-lg flex items-center justify-center mr-4">
                <Bot className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Assistant</h1>
                <p className="text-github-text-secondary">
                  Get intelligent help with coding, music creation, and CodeBeat fusion
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">24/7 Available</Badge>
              <Badge variant="secondary">Multi-Domain Expert</Badge>
              <Badge variant="secondary">Context-Aware</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="bg-github-secondary border-github-border h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5 text-accent-cyan" />
                    Chat with AI Assistant
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-accent-purple text-white'
                                : 'bg-github-dark border border-github-border'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.type === 'assistant' && (
                                <Bot className="h-4 w-4 text-accent-cyan mt-1 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                
                                {message.suggestions && message.suggestions.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs text-github-text-secondary">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {message.suggestions.map((suggestion, index) => (
                                        <Button
                                          key={index}
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleSuggestionClick(suggestion)}
                                          className="text-xs"
                                        >
                                          {suggestion}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-github-text-secondary">
                                {formatTime(message.timestamp)}
                              </span>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {message.type === 'assistant' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {assistMutation.isPending && (
                        <div className="flex justify-start">
                          <div className="bg-github-dark border border-github-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Bot className="h-4 w-4 text-accent-cyan animate-pulse" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  {/* Input */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything about coding, music, or CodeBeat fusion..."
                        className="flex-1 bg-github-dark border-github-border"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || assistMutation.isPending}
                        className="bg-gradient-to-r from-accent-cyan to-accent-purple"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Input
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Add context (optional): current project, specific technology, etc."
                      className="bg-github-dark border-github-border text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Provider Selector */}
              <Card className="bg-github-secondary border-github-border">
                <CardHeader>
                  <CardTitle className="text-sm">AI Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <AIProviderSelector
                    value={aiProvider}
                    onValueChange={setAiProvider}
                  />
                </CardContent>
              </Card>

              {/* Quick Prompts */}
              <Card className="bg-github-secondary border-github-border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                    Quick Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {QUICK_PROMPTS.map((prompt, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickPrompt(prompt)}
                        className="w-full justify-start text-xs h-auto py-2 whitespace-normal"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Capabilities */}
              <Card className="bg-github-secondary border-github-border">
                <CardHeader>
                  <CardTitle className="text-sm">AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-accent-purple" />
                      <span className="text-sm">Code debugging & optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Music className="h-4 w-4 text-accent-pink" />
                      <span className="text-sm">Music theory & composition</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-accent-cyan" />
                      <span className="text-sm">CodeBeat fusion guidance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-accent-purple" />
                      <span className="text-sm">Technical explanations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Conversations */}
              <Card className="bg-github-secondary border-github-border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Recent Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {EXAMPLE_CONVERSATIONS.map((conv, index) => (
                      <div key={index} className="p-2 bg-github-dark rounded-lg">
                        <h4 className="font-medium text-sm">{conv.title}</h4>
                        <p className="text-xs text-github-text-secondary mt-1">
                          {conv.preview}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conv.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-accent-cyan/10 border-accent-cyan/20">
                <CardHeader>
                  <CardTitle className="text-sm text-accent-cyan">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-xs">
                    <li>• Be specific about your coding language</li>
                    <li>• Include error messages for debugging</li>
                    <li>• Mention your musical background level</li>
                    <li>• Use context field for better responses</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
