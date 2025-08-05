import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
// OpenAI removed - using only Gemini and Grok
import {
  translateCodeWithGemini,
  generateLyricsWithGemini,
  generateBeatWithGemini,
  convertCodeToMusicWithGemini,
  getAIAssistanceWithGemini
} from "./gemini";
import {
  translateCodeWithGrok,
  generateLyricsWithGrok,
  generateBeatWithGrok,
  convertCodeToMusicWithGrok,
  getAIAssistanceWithGrok
} from "./grok";
import {
  insertUserSchema,
  insertProjectSchema,
  insertCodeTranslationSchema,
  insertMusicGenerationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Providers endpoint
  app.get("/api/ai/providers", (req, res) => {
    const providers = [
      {
        id: "grok",
        name: "xAI Grok",
        description: "Creative AI with wit, humor, and innovative thinking",
        features: ["Code Translation", "Lyric Generation", "Beat Creation", "Code-to-Music", "AI Assistant"],
        available: !!process.env.XAI_API_KEY
      },
      {
        id: "gemini",
        name: "Google Gemini",
        description: "Multimodal AI with strong creative and analytical capabilities",
        features: ["Code Translation", "Lyric Generation", "Beat Creation", "Code-to-Music", "AI Assistant"],
        available: !!process.env.GEMINI_API_KEY
      }
    ];
    
    // Debug logging for deployment
    console.log("API Keys Check:", {
      XAI_API_KEY: !!process.env.XAI_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      providers: providers.map(p => ({ id: p.id, available: p.available }))
    });
    
    res.json(providers);
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to create user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Code translation routes
  app.post("/api/code/translate", async (req, res) => {
    try {
      const schema = z.object({
        sourceCode: z.string().min(1),
        sourceLanguage: z.string().min(1),
        targetLanguage: z.string().min(1),
        userId: z.string().optional(),
        aiProvider: z.enum(["gemini", "grok"]).default("grok")
      });

      const { sourceCode, sourceLanguage, targetLanguage, userId, aiProvider } = schema.parse(req.body);
      
      let result: any;
      switch (aiProvider) {
        case "gemini":
          result = await translateCodeWithGemini(sourceCode, sourceLanguage, targetLanguage);
          break;
        default:
          result = await translateCodeWithGrok(sourceCode, sourceLanguage, targetLanguage);
      }
      
      // Extract translated code - handle different return types
      const translatedCodeResult = typeof result === 'string' ? result : result.translatedCode;
      
      // Save translation if user is provided
      if (userId) {
        const translation = await storage.createCodeTranslation({
          userId,
          sourceLanguage,
          targetLanguage,
          sourceCode,
          translatedCode: translatedCodeResult
        });
        res.json({ translatedCode: translatedCodeResult, id: translation.id });
      } else {
        res.json({ translatedCode: translatedCodeResult });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to translate code", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/users/:userId/translations", async (req, res) => {
    try {
      const translations = await storage.getUserCodeTranslations(req.params.userId);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch translations", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Lyrics routes
  app.post("/api/lyrics/generate", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1),
        genre: z.string().optional(),
        mood: z.string().optional(),
        userId: z.string().optional(),
        aiProvider: z.enum(["gemini", "grok"]).default("grok")
      });

      const { prompt, genre, mood, userId, aiProvider } = schema.parse(req.body);
      
      let result: any;
      switch (aiProvider) {
        case "gemini":
          result = { lyrics: await generateLyricsWithGemini(prompt, mood, genre) };
          break;
        default:
          result = { lyrics: await generateLyricsWithGrok(prompt, mood, genre) };
      }
      
      // Save generation if user is provided
      if (userId) {
        const generation = await storage.createMusicGeneration({
          userId,
          type: "lyrics",
          prompt,
          result
        });
        res.json({ ...result, id: generation.id });
      } else {
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate lyrics", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/lyrics/analyze", async (req, res) => {
    try {
      const schema = z.object({
        lyrics: z.string().min(1)
      });

      const { lyrics } = schema.parse(req.body);
      // Use Grok for lyrics analysis since OpenAI was removed
      const result = await generateLyricsWithGrok(`Analyze these lyrics: ${lyrics}`, "analytical", "analysis");
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to analyze lyrics", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Beat generation routes
  app.post("/api/beat/generate", async (req, res) => {
    try {
      const schema = z.object({
        genre: z.string().min(1),
        bpm: z.number().min(60).max(200),
        duration: z.number().min(1).max(300),
        userId: z.string().optional(),
        aiProvider: z.enum(["gemini", "grok"]).default("grok")
      });

      const { genre, bpm, duration, userId, aiProvider } = schema.parse(req.body);
      
      let result: any;
      switch (aiProvider) {
        case "gemini":
          result = await generateBeatWithGemini(genre, bpm);
          break;
        default:
          result = await generateBeatWithGrok(genre, bpm);
      }
      
      // Save generation if user is provided
      if (userId) {
        const generation = await storage.createMusicGeneration({
          userId,
          type: "beat",
          prompt: `${genre} beat at ${bpm} BPM`,
          result
        });
        res.json({ ...result, id: generation.id });
      } else {
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate beat", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // CodeBeat fusion routes
  app.post("/api/codebeat/convert", async (req, res) => {
    try {
      const schema = z.object({
        code: z.string().min(1),
        language: z.string().min(1),
        userId: z.string().optional(),
        aiProvider: z.enum(["gemini", "grok"]).default("grok")
      });

      const { code, language, userId, aiProvider } = schema.parse(req.body);
      
      let result: any;
      switch (aiProvider) {
        case "gemini":
          result = await convertCodeToMusicWithGemini(code, language);
          break;
        default:
          result = await convertCodeToMusicWithGrok(code, language);
      }
      
      // Save generation if user is provided
      if (userId) {
        const generation = await storage.createMusicGeneration({
          userId,
          type: "codebeat",
          prompt: `Convert ${language} code to music`,
          result
        });
        res.json({ ...result, id: generation.id });
      } else {
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to convert code to music", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // AI Assistant routes
  app.post("/api/ai/assist", async (req, res) => {
    try {
      const schema = z.object({
        question: z.string().min(1),
        context: z.string().optional(),
        aiProvider: z.enum(["gemini", "grok"]).default("grok")
      });

      const { question, context, aiProvider } = schema.parse(req.body);
      
      let result: any;
      switch (aiProvider) {
        case "gemini":
          result = { answer: await getAIAssistanceWithGemini(question, context) };
          break;
        default:
          result = { answer: await getAIAssistanceWithGrok(question, context) };
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to get AI assistance", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Project routes
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to create project", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/users/:userId/projects", async (req, res) => {
    try {
      const projects = await storage.getUserProjects(req.params.userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch projects", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/users/:userId/music-generations", async (req, res) => {
    try {
      const generations = await storage.getUserMusicGenerations(req.params.userId);
      res.json(generations);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch music generations", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
