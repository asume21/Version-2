import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Code, 
  Music, 
  Zap, 
  Bot, 
  TrendingUp, 
  Clock,
  Star,
  Play
} from "lucide-react";
import { Waveform } from "@/components/ui/waveform";

export default function Dashboard() {
  const quickActions = [
    {
      title: "Translate Code",
      description: "Convert code between languages",
      icon: Code,
      href: "/code-translator",
      color: "purple"
    },
    {
      title: "Generate Lyrics",
      description: "Create AI-powered lyrics",
      icon: Music,
      href: "/lyric-lab",
      color: "pink"
    },
    {
      title: "Create Beat",
      description: "Generate musical beats",
      icon: Music,
      href: "/beat-studio",
      color: "cyan"
    },
    {
      title: "CodeBeat Fusion",
      description: "Transform code into music",
      icon: Zap,
      href: "/codebeat-studio",
      color: "purple"
    }
  ];

  const recentProjects = [
    {
      name: "React to Vue Translation",
      type: "Code Translation",
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      name: "Hip-Hop Beat Generation",
      type: "Music Creation",
      timestamp: "5 hours ago",
      status: "completed"
    },
    {
      name: "JavaScript Melody",
      type: "CodeBeat Fusion",
      timestamp: "1 day ago",
      status: "completed"
    }
  ];

  const stats = [
    { label: "Code Translations", value: "24", trend: "+12%" },
    { label: "Music Generations", value: "18", trend: "+8%" },
    { label: "AI Assists", value: "42", trend: "+15%" },
    { label: "CodeBeat Fusions", value: "6", trend: "+25%" }
  ];

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to <span className="text-gradient-purple-pink">CodedSwitch</span>
            </h1>
            <p className="text-github-text-secondary">
              Your creative coding and music workspace
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-github-secondary border-github-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-github-text-secondary text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-green-500 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="bg-github-secondary border-github-border hover:border-accent-purple/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 bg-accent-${action.color}/20 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                        <action.icon className={`text-accent-${action.color} h-6 w-6`} />
                      </div>
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      <p className="text-github-text-secondary text-sm">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-github-dark rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-github-text-secondary text-sm">{project.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-500 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs">Completed</span>
                        </div>
                        <p className="text-github-text-secondary text-xs">{project.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Projects
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-accent-cyan" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-github-dark rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-accent-cyan/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-accent-cyan" />
                      </div>
                      <div>
                        <p className="text-sm text-github-text-secondary mb-2">💡 AI Suggestion:</p>
                        <p className="text-sm">
                          Try converting your Python sorting algorithm to a rhythmic pattern in the CodeBeat Studio!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Quick Help Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Code Translation
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Music Theory
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Beat Creation
                      </Button>
                    </div>
                  </div>
                </div>
                <Link href="/ai-assistant">
                  <Button className="w-full mt-4 bg-gradient-to-r from-accent-cyan to-accent-purple">
                    Chat with AI Assistant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Featured Tools */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Featured Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-github-secondary border-github-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Star className="text-yellow-500 h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Most Popular</span>
                  </div>
                  <h3 className="font-semibold mb-2">Code Translator</h3>
                  <p className="text-github-text-secondary text-sm mb-4">
                    Convert between 50+ programming languages with AI precision
                  </p>
                  <Link href="/code-translator">
                    <Button className="w-full">Try Now</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-github-secondary border-github-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Waveform className="h-8" bars={5} color="pink" />
                  </div>
                  <h3 className="font-semibold mb-2">Beat Studio</h3>
                  <p className="text-github-text-secondary text-sm mb-4">
                    Create professional beats with AI-powered assistance
                  </p>
                  <Link href="/beat-studio">
                    <Button className="w-full">Create Beat</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-github-secondary border-github-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Zap className="text-accent-cyan h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Revolutionary</span>
                  </div>
                  <h3 className="font-semibold mb-2">CodeBeat Fusion</h3>
                  <p className="text-github-text-secondary text-sm mb-4">
                    Transform your code into musical compositions
                  </p>
                  <Link href="/codebeat-studio">
                    <Button className="w-full">Fuse Now</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
