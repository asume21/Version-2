import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Bot, Sparkles, Zap } from "lucide-react";

interface AIProvider {
  id: string;
  name: string;
  description: string;
  features: string[];
  available: boolean;
}

interface AIProviderSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  // Optional list of provider IDs to allow (e.g., ["grok"]) 
  allowedIds?: string[];
}

export function AIProviderSelector({ value, onValueChange, className, allowedIds }: AIProviderSelectorProps) {
  const { data: providers = [] } = useQuery<AIProvider[]>({
    queryKey: ["/api/ai/providers"],
  });

  const availableProviders = providers.filter(p => p.available);
  const filteredProviders = (allowedIds && allowedIds.length > 0)
    ? availableProviders.filter(p => allowedIds.includes(p.id))
    : availableProviders;

  // Set default to first available provider if current value is not available
  useEffect(() => {
    if (filteredProviders.length > 0 && !filteredProviders.some(p => p.id === value)) {
      onValueChange(filteredProviders[0].id);
    }
  }, [filteredProviders, value, onValueChange]);

  const getProviderIcon = (id: string) => {
    switch (id) {
      case "openai":
        return <Bot className="h-4 w-4" />;
      case "gemini":
        return <Sparkles className="h-4 w-4" />;
      case "grok":
        return <Zap className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getProviderColor = (id: string) => {
    switch (id) {
      case "openai":
        return "text-emerald-400";
      case "gemini":
        return "text-blue-400";
      case "grok":
        return "text-purple-400";
      default:
        return "text-purple-400";
    }
  };

  if (filteredProviders.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-github-text-secondary">
        <Bot className="h-4 w-4" />
        <span>No AI providers available</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-48 ${className}`}>
        <SelectValue>
          {filteredProviders.find(p => p.id === value) && (
            <div className="flex items-center space-x-2">
              <span className={getProviderColor(value)}>
                {getProviderIcon(value)}
              </span>
              <span>{filteredProviders.find(p => p.id === value)?.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {filteredProviders.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className={getProviderColor(provider.id)}>
                  {getProviderIcon(provider.id)}
                </span>
                <span className="font-medium">{provider.name}</span>
                <Badge variant="outline" className="text-xs">
                  Available
                </Badge>
              </div>
              <p className="text-xs text-github-text-secondary max-w-64">
                {provider.description}
              </p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}