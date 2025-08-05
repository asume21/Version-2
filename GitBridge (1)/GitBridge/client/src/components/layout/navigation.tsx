import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Code, Music, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: null },
    { href: "/code-translator", label: "Code Translator", icon: Code },
    { href: "/lyric-lab", label: "Lyric Lab", icon: Music },
    { href: "/beat-studio", label: "Beat Studio", icon: Music },
    { href: "/music-studio", label: "Music Studio", icon: Music },
    { href: "/codebeat-studio", label: "CodeBeat", icon: Zap },
    { href: "/ai-assistant", label: "AI Assistant", icon: null },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full bg-github-dark/80 backdrop-blur-md border-b border-github-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-purple-pink rounded-lg flex items-center justify-center">
                <Code className="text-white h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-accent-cyan to-accent-pink rounded-full flex items-center justify-center">
                <Music className="text-white h-3 w-3" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="accent-purple">Coded</span>
                <span className="accent-pink">Switch</span>
              </h1>
              <p className="text-xs text-github-text-secondary font-mono">Where Code Meets Music</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.slice(1, -1).map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "text-sm transition-colors hover:text-github-text",
                  isActive(item.href) ? "text-github-text" : "text-github-text-secondary"
                )}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/ai-assistant">
              <Button variant="ghost" size="sm">
                AI Assistant
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-gradient-purple-pink hover:opacity-90">
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-github-border">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive(item.href) 
                        ? "bg-github-secondary text-github-text" 
                        : "text-github-text-secondary hover:text-github-text hover:bg-github-secondary/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
