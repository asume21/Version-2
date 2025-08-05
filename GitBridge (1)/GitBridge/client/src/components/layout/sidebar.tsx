import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Music, 
  Zap, 
  Bot, 
  BarChart3, 
  Settings,
  Home,
  FileText,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const sidebarItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/code-translator", label: "Code Translator", icon: Code },
    { href: "/lyric-lab", label: "Lyric Lab", icon: FileText },
    { href: "/beat-studio", label: "Beat Studio", icon: Headphones },
    { href: "/music-studio", label: "Music Studio", icon: Music },
    { href: "/codebeat-studio", label: "CodeBeat Studio", icon: Zap },
    { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    return location === href || (href !== "/dashboard" && location.startsWith(href));
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-github-secondary border-r border-github-border">
      <div className="p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left",
                  isActive(item.href) 
                    ? "bg-github-dark text-github-text" 
                    : "text-github-text-secondary hover:text-github-text hover:bg-github-dark/50"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-4 border-t border-github-border">
          <h3 className="text-sm font-medium text-github-text-secondary mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Code className="mr-2 h-3 w-3" />
              New Translation
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Music className="mr-2 h-3 w-3" />
              Generate Beat
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Zap className="mr-2 h-3 w-3" />
              Code to Music
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
