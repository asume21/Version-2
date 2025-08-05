import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({ 
  code, 
  language, 
  onChange, 
  readOnly = false,
  className 
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Code copied!",
        description: "The code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const syntaxHighlight = (code: string, lang: string) => {
    // Simple syntax highlighting for demo purposes
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return'],
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import'],
      java: ['public', 'private', 'class', 'interface', 'if', 'else', 'for', 'while', 'return'],
      typescript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'interface', 'type']
    };

    let highlighted = code;
    const langKeywords = keywords[lang as keyof typeof keywords] || [];
    
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-accent-cyan">${keyword}</span>`);
    });

    // Highlight strings
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-accent-pink">"$1"</span>');
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="text-accent-pink">\'$1\'</span>');

    // Highlight comments
    highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="text-github-text-secondary">$&</span>');
    highlighted = highlighted.replace(/#.*$/gm, '<span class="text-github-text-secondary">$&</span>');

    return highlighted;
  };

  return (
    <div className={cn("bg-github-dark rounded-lg border border-github-border", className)}>
      <div className="flex items-center justify-between p-3 border-b border-github-border">
        <span className="text-sm font-mono text-github-text-secondary">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="p-4">
        {readOnly ? (
          <pre className="text-sm font-mono text-github-text whitespace-pre-wrap">
            <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(code, language) }} />
          </pre>
        ) : (
          <textarea
            value={code}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-64 bg-transparent text-sm font-mono text-github-text resize-none outline-none"
            placeholder={`Enter your ${language} code here...`}
          />
        )}
      </div>
    </div>
  );
}
