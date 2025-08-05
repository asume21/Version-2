import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Music, Zap, Bot, Github, Rocket, Play } from "lucide-react";
import { Waveform } from "@/components/ui/waveform";
import { AudioVisualizer } from "@/components/ui/audio-visualizer";
import { CodeEditor } from "@/components/ui/code-editor";
import { useState } from "react";

export default function Landing() {
  const [isPlaying, setIsPlaying] = useState(false);

  const sampleCode = `function createMelody(notes) {
  const rhythm = [];
  for (let i = 0; i < notes.length; i++) {
    rhythm.push(notes[i] * 2);
  }
  return rhythm;
}`;

  const features = [
    {
      icon: Code,
      title: "Code Translator",
      description: "Transform code between languages with AI precision",
      color: "purple"
    },
    {
      icon: Music,
      title: "Music Studio",
      description: "Create beats and melodies with AI collaboration",
      color: "pink"
    },
    {
      icon: Zap,
      title: "CodeBeat Fusion",
      description: "Turn your code into music and vice versa",
      color: "cyan"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get intelligent coding assistance and guidance",
      color: "purple"
    }
  ];

  const techStack = [
    { name: "React", icon: "⚛️" },
    { name: "Python", icon: "🐍" },
    { name: "Docker", icon: "🐳" },
    { name: "Grok AI", icon: "🧠" },
    { name: "Tone.js", icon: "🎵" },
    { name: "Redis", icon: "📊" }
  ];

  return (
    <div className="min-h-screen bg-github-dark text-github-text">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-gradient-full">CodedSwitch</span>
            </h1>
            <p className="text-xl md:text-2xl text-github-text-secondary mb-4 max-w-3xl mx-auto">
              The world's first AI-powered platform that bridges{" "}
              <span className="accent-purple font-mono">code</span> and{" "}
              <span className="accent-pink">music</span> creation
            </p>
            <p className="text-lg text-github-text-secondary mb-12 max-w-2xl mx-auto">
              Switch seamlessly between programming languages, musical genres, and creative modes with AI assistance
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto px-8 py-4 bg-gradient-purple-pink text-white font-semibold text-lg hover:scale-105 transition-transform shadow-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  Launch CodedSwitch
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto px-8 py-4 border-github-border hover:border-accent-cyan transition-colors"
                asChild
              >
                <a href="https://github.com/asume21/Codedswitch-minimal" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* Feature Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.slice(0, 3).map((feature, index) => (
                <Card key={index} className="bg-github-secondary/50 backdrop-blur-sm border-github-border hover:border-accent-purple/50 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                      <feature.icon className={`text-accent-${feature.color} h-6 w-6`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-github-text-secondary text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Audio Waveform Visualization */}
          <div className="flex justify-center">
            <Waveform className="opacity-60" bars={9} />
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-github-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful <span className="accent-purple">AI Tools</span> for{" "}
              <span className="accent-pink">Creative</span> Development
            </h2>
            <p className="text-xl text-github-text-secondary max-w-3xl mx-auto">
              Experience the future of coding and music creation with our comprehensive suite of AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-github-secondary border-github-border hover:border-accent-purple/50 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br from-accent-${feature.color} to-accent-${feature.color}/70 rounded-xl flex items-center justify-center mr-4`}>
                      <feature.icon className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-github-text-secondary text-sm">AI-powered</p>
                    </div>
                  </div>
                  <p className="text-github-text-secondary mb-6">{feature.description}</p>
                  <Link href={`/${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Try Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Experience the <span className="accent-cyan">Switch</span>
            </h2>
            <p className="text-xl text-github-text-secondary max-w-3xl mx-auto">
              See how CodedSwitch seamlessly transforms between coding and music creation modes
            </p>
          </div>

          {/* Demo Interface */}
          <Card className="bg-github-secondary border-github-border overflow-hidden shadow-2xl">
            {/* Demo Header */}
            <div className="bg-github-dark border-b border-github-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-github-text-secondary text-sm font-mono">codedswitch-demo.js</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-accent-purple/30 text-accent-purple hover:bg-accent-purple/20">
                    <Code className="mr-1 h-3 w-3" />
                    Code Mode
                  </Button>
                  <span className="text-github-text-secondary">⇄</span>
                  <Button size="sm" variant="outline" className="border-accent-pink/30 text-accent-pink hover:bg-accent-pink/20">
                    <Music className="mr-1 h-3 w-3" />
                    Music Mode
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Code Panel */}
              <div className="p-6 border-r border-github-border">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold accent-purple mb-2 flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Code Input
                  </h3>
                </div>
                <CodeEditor
                  code={sampleCode}
                  language="javascript"
                  readOnly
                  className="h-64"
                />
              </div>

              {/* Music Panel */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold accent-pink mb-2 flex items-center">
                    <Music className="mr-2 h-5 w-5" />
                    Music Output
                  </h3>
                </div>
                <Card className="bg-github-dark border-github-border h-64">
                  <CardContent className="p-4 h-full flex flex-col">
                    <AudioVisualizer 
                      className="flex-1 mb-4" 
                      isPlaying={isPlaying}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          className="w-10 h-10 bg-accent-pink/20 hover:bg-accent-pink/30 rounded-full p-0"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          <Play className="text-accent-pink h-4 w-4" />
                        </Button>
                        <div className="text-sm">
                          <div className="text-white">Generated Melody</div>
                          <div className="text-github-text-secondary text-xs">120 BPM • C Major</div>
                        </div>
                      </div>
                      <div className="text-xs text-github-text-secondary">
                        🎵 Algorithm-driven composition
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Demo Status */}
            <div className="bg-github-dark border-t border-github-border p-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center accent-purple">
                  <div className="w-2 h-2 bg-accent-purple rounded-full mr-2 animate-pulse"></div>
                  Code Analysis: Complete
                </div>
                <div className="flex items-center accent-cyan">
                  <div className="w-2 h-2 bg-accent-cyan rounded-full mr-2 animate-pulse"></div>
                  AI Processing: Active
                </div>
                <div className="flex items-center accent-pink">
                  <div className="w-2 h-2 bg-accent-pink rounded-full mr-2 animate-pulse"></div>
                  Music Generation: Ready
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-github-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built with <span className="accent-cyan">Modern</span> Technology
            </h2>
            <p className="text-xl text-github-text-secondary max-w-3xl mx-auto">
              Powered by cutting-edge tools and frameworks for optimal performance and scalability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {techStack.map((tech, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-github-secondary border border-github-border rounded-xl flex items-center justify-center mb-3 group-hover:border-accent-cyan transition-colors">
                  <span className="text-2xl">{tech.icon}</span>
                </div>
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>

          {/* GitHub Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold accent-purple mb-2">137+</div>
              <div className="text-github-text-secondary">Commits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold accent-pink mb-2">8</div>
              <div className="text-github-text-secondary">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold accent-cyan mb-2">24/7</div>
              <div className="text-github-text-secondary">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/5 to-pink-500/10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="text-gradient-full">Switch</span>?
          </h2>
          <p className="text-xl text-github-text-secondary mb-12 max-w-2xl mx-auto">
            Join thousands of developers and musicians who are already creating with CodedSwitch
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto px-8 py-4 bg-gradient-purple-pink text-white font-semibold text-lg hover:scale-105 transition-transform shadow-lg">
                <Rocket className="mr-2 h-5 w-5" />
                Start Creating Now
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto px-8 py-4 border-github-border hover:border-accent-cyan transition-colors"
              asChild
            >
              <a href="https://github.com/asume21/Codedswitch-minimal" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                Fork on GitHub
              </a>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-github-text-secondary">
            <a href="mailto:servicehelp@codedswitch.com" className="flex items-center hover:text-accent-cyan transition-colors">
              <span className="mr-2">✉️</span>
              servicehelp@codedswitch.com
            </a>
            <a href="https://github.com/asume21" className="flex items-center hover:text-accent-purple transition-colors">
              <Github className="mr-2 h-4 w-4" />
              @asume21
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
