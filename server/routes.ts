import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
// Providers
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
  translateCode as translateCodeWithOpenAI,
  generateLyrics as generateLyricsWithOpenAI,
  analyzeLyrics as analyzeLyricsWithOpenAI,
  generateBeatPattern as generateBeatWithOpenAI,
  codeToMusic as convertCodeToMusicWithOpenAI,
  getAIAssistance as getAIAssistanceWithOpenAI,
} from "./openai";
import {
  insertUserSchema,
  insertProjectSchema,
  insertCodeTranslationSchema,
  insertMusicGenerationSchema
} from "../shared/schema";
import { stripe, isStripeEnabled } from "./stripe";

// Free tier configuration (simple in-memory usage limiter)
const FREE_TIER_ENABLED = process.env.FREE_TIER_ENABLED !== "false";
const FREE_TIER_DAILY_LIMIT = parseInt(process.env.FREE_TIER_DAILY_LIMIT || "10", 10);

const usageCounters = new Map<string, number>();

function getClientKey(req: express.Request) {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
  const ip = fwd || req.ip || (req.socket as any)?.remoteAddress || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  return `${ip}:${day}`;
}

function withUsageLimit<T extends express.Request, U extends express.Response>(
  handler: (req: T, res: U) => Promise<any>
) {
  return async (req: T, res: U) => {
    if (FREE_TIER_ENABLED) {
      const key = getClientKey(req);
      const count = usageCounters.get(key) ?? 0;
      if (count >= FREE_TIER_DAILY_LIMIT) {
        return res.status(429).json({
          message: "Free tier daily limit reached. Please upgrade at /billing.",
          limit: FREE_TIER_DAILY_LIMIT,
        });
      }
      usageCounters.set(key, count + 1);
    }
    return handler(req, res);
  };
}

// Simple heuristic lyrics analysis to ensure consistent responses without relying on external AI
function simpleLyricAnalysis(lyrics: string): {
  sentiment: string;
  themes: string[];
  rhymeScheme: string;
  complexity: number;
} {
  const lines = lyrics.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const words = (lyrics.toLowerCase().match(/[a-z']+/g) || []);

  // Sentiment (very naive): positive/negative word counts
  const positive = new Set([
    "love","happy","joy","dream","hope","win","shine","bright","good","great","best","smile","strong","calm","peace","light"
  ]);
  const negative = new Set([
    "sad","cry","hurt","pain","lonely","dark","bad","worst","tears","fear","broken","lost","angry","mad"
  ]);
  let score = 0;
  for (const w of words) {
    if (positive.has(w)) score += 1;
    if (negative.has(w)) score -= 1;
  }
  const sentiment = score > 1 ? "positive" : score < -1 ? "negative" : "neutral";

  // Rhyme scheme: map last 2 letters of last word per line to letters A, B, C, ...
  const endings = lines.map((l) => (l.trim().split(/\s+/).pop() || "").toLowerCase().replace(/[^a-z]/g, "")).map((w) => w.slice(-2));
  const rhymeMap = new Map<string, string>();
  let nextCode = 65; // 'A'
  const scheme = endings.map((end) => {
    const key = end || `line-${Math.random().toString(36).slice(2, 6)}`;
    if (!rhymeMap.has(key)) rhymeMap.set(key, String.fromCharCode(nextCode++));
    return rhymeMap.get(key)!;
  }).join("");

  // Complexity: scaled unique word ratio
  const unique = new Set(words).size;
  const complexity = Math.max(1, Math.min(10, Math.round((unique / (words.length || 1)) * 10)));

  // Themes: top non-stopword tokens
  const stop = new Set(["the","and","a","to","of","in","is","it","i","you","my","your","on","for","with","that","this","we","me","be","as","our","at","from","by","an","are","was","were"]);
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3 || stop.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const themes = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);

  return { sentiment, themes, rhymeScheme: scheme || "unknown", complexity };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe webhook must use raw body for signature verification
  app.post("/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      if (!isStripeEnabled()) {
        return res.status(200).send();
      }

      const sig = req.headers["stripe-signature"] as string | undefined;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!sig || !webhookSecret) {
        return res.status(400).send("Missing Stripe signature or webhook secret");
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          console.log("Checkout completed", session.id);
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.created":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          console.log("Subscription event", subscription.id, subscription.status);
          break;
        }
        default:
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Stripe webhook error", err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  });

  // Mount JSON/urlencoded parsers after webhook
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Billing endpoints
  app.get("/api/billing/plans", async (_req, res) => {
    if (!isStripeEnabled()) return res.json({ enabled: false, plans: [] });
    try {
      // Support both STRIPE_PRICE_BASIC/PRO and STRIPE_PRICE_ID_BASIC/PRO
      const priceIds = [
        process.env.STRIPE_PRICE_BASIC || process.env.STRIPE_PRICE_ID_BASIC,
        process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_ID_PRO,
      ].filter(Boolean) as string[];

      const prices: any[] = priceIds.length
        ? (await Promise.all(priceIds.map((id) => stripe.prices.retrieve(id)))) as any[]
        : ((await stripe.prices.list({ active: true, limit: 10 })).data as any[]);

      const productsMap = new Map<string, any>();
      // Fetch products for prices
      for (const price of prices) {
        if (typeof price.product === "string") {
          if (!productsMap.has(price.product)) {
            const product = (await stripe.products.retrieve(price.product)) as any;
            productsMap.set(product.id, product);
          }
        }
      }

      const plans = prices.map((p: any) => {
        const productId = typeof p.product === "string" ? p.product : p.product.id;
        const product = productsMap.get(productId);
        return {
          id: p.id,
          nickname: p.nickname || product?.name || "Plan",
          unitAmount: p.unit_amount,
          currency: p.currency,
          interval: (p.recurring && p.recurring.interval) || null,
          productId,
        };
      });
      // Always expose a synthetic Free plan as an entry point
      if (FREE_TIER_ENABLED) {
        plans.unshift({
          id: "free",
          nickname: "Free",
          unitAmount: 0,
          currency: "usd",
          interval: "month",
          productId: "free",
        });
      }
      res.json({ enabled: true, plans });
    } catch (e) {
      res.status(500).json({ enabled: false, message: e instanceof Error ? e.message : "Failed to load plans" });
    }
  });

  app.get("/api/billing/status", async (req, res) => {
    if (!isStripeEnabled()) return res.json({ enabled: false });
    try {
      const email = req.query.email as string | undefined;
      const customerId = req.query.customerId as string | undefined;
      if (!email && !customerId) {
        return res.status(400).json({ message: "email or customerId is required" });
      }

      let customer: any | null = null;
      if (customerId) {
        customer = (await stripe.customers.retrieve(customerId)) as any;
      } else if (email) {
        const list = await stripe.customers.list({ email, limit: 1 });
        customer = list.data[0] || null;
      }
      if (!customer) return res.json({ enabled: true, active: false });

      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 1 });
      const sub = subs.data[0];
      res.json({ enabled: true, active: !!sub && ["active", "trialing", "past_due"].includes(sub.status), status: sub?.status || null, subscriptionId: sub?.id || null });
    } catch (e) {
      res.status(500).json({ enabled: false, message: e instanceof Error ? e.message : "Failed to get status" });
    }
  });

  app.post("/api/billing/create-checkout-session", async (req, res) => {
    try {
      if (!isStripeEnabled()) return res.status(400).json({ message: "Stripe not configured" });
      const schema = z.object({
        priceId: z.string().min(1),
        email: z.string().email().optional(),
        successUrl: z.string().min(1),
        cancelUrl: z.string().min(1),
      });
      const { priceId, email, successUrl, cancelUrl } = schema.parse(req.body);

      let customerId: string | undefined;
      if (email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length) customerId = customers.data[0].id;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: email && !customerId ? email : undefined,
        customer: customerId,
        allow_promotion_codes: true,
      });
      res.json({ url: session.url });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/create-portal-session", async (req, res) => {
    try {
      if (!isStripeEnabled()) return res.status(400).json({ message: "Stripe not configured" });
      const schema = z.object({
        customerId: z.string().optional(),
        email: z.string().email().optional(),
        returnUrl: z.string().min(1),
      });
      const { customerId, email, returnUrl } = schema.parse(req.body);
      let resolvedCustomerId = customerId;
      if (!resolvedCustomerId && email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (!customers.data.length) return res.status(400).json({ message: "Customer not found for email" });
        resolvedCustomerId = customers.data[0].id;
      }
      if (!resolvedCustomerId) return res.status(400).json({ message: "customerId or email is required" });

      const portal = await stripe.billingPortal.sessions.create({ customer: resolvedCustomerId, return_url: returnUrl });
      res.json({ url: portal.url });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Failed to create portal session" });
    }
  });

  // AI Providers endpoint
  app.get("/api/ai/providers", (req, res) => {
    const providers = [
      {
        id: "openai",
        name: "OpenAI",
        description: "Versatile reasoning models for code and creative tasks",
        features: ["Code Translation", "Lyric Generation", "Beat Creation", "Code-to-Music", "AI Assistant"],
        available: !!process.env.OPENAI_API_KEY,
      },
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
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
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
  app.post("/api/code/translate", withUsageLimit(async (req, res) => {
    try {
      const schema = z.object({
        sourceCode: z.string().min(1),
        sourceLanguage: z.string().min(1),
        targetLanguage: z.string().min(1),
        userId: z.string().optional(),
        aiProvider: z.enum(["openai", "grok", "gemini"]).default("grok")
      });

      const { sourceCode, sourceLanguage, targetLanguage, userId, aiProvider } = schema.parse(req.body);

      // Provider availability guards
      if (aiProvider === "openai" && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured" });
      }
      if (aiProvider === "grok" && !process.env.XAI_API_KEY) {
        return res.status(400).json({ message: "Grok (xAI) API key not configured" });
      }
      if (aiProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ message: "Gemini API key not configured" });
      }
      
      let result: any;
      switch (aiProvider) {
        case "openai":
          result = await translateCodeWithOpenAI(sourceCode, sourceLanguage, targetLanguage);
          break;
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
  }));

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
  app.post("/api/lyrics/generate", withUsageLimit(async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1),
        genre: z.string().optional(),
        mood: z.string().optional(),
        userId: z.string().optional(),
        aiProvider: z.enum(["openai", "grok", "gemini"]).default("grok")
      });

      const { prompt, genre, mood, userId, aiProvider } = schema.parse(req.body);
      if (aiProvider === "openai" && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured" });
      }
      if (aiProvider === "grok" && !process.env.XAI_API_KEY) {
        return res.status(400).json({ message: "Grok (xAI) API key not configured" });
      }
      if (aiProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ message: "Gemini API key not configured" });
      }
      
      let result: any;
      switch (aiProvider) {
        case "openai":
          result = await generateLyricsWithOpenAI(prompt, genre, mood);
          break;
        case "gemini":
          result = { lyrics: await generateLyricsWithGemini(prompt, mood, genre) };
          break;
        default:
          result = { lyrics: await generateLyricsWithGrok(prompt, mood, genre) };
      }
      // Normalize response shape across providers
      const lyricsText: string = typeof result === "string" ? result : result.lyrics;
      const analysis = simpleLyricAnalysis(lyricsText || "");
      const normalized = {
        lyrics: lyricsText || "",
        rhymeScheme: result.rhymeScheme ?? analysis.rhymeScheme,
        sentiment: result.sentiment ?? analysis.sentiment,
      };
      
      // Save generation if user is provided
      if (userId) {
        const generation = await storage.createMusicGeneration({
          userId,
          type: "lyrics",
          prompt,
          result: normalized
        });
        res.json({ ...normalized, id: generation.id });
      } else {
        res.json(normalized);
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate lyrics", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }));

  app.post("/api/lyrics/analyze", withUsageLimit(async (req, res) => {
    try {
      const schema = z.object({
        lyrics: z.string().min(1),
        aiProvider: z.enum(["openai", "grok", "gemini"]).optional(),
      });

      const { lyrics, aiProvider } = schema.parse(req.body);

      let analysis;
      if (aiProvider === "openai" && process.env.OPENAI_API_KEY) {
        analysis = await analyzeLyricsWithOpenAI(lyrics);
      } else {
        // Fallback to heuristic analysis to ensure consistent response shape
        analysis = simpleLyricAnalysis(lyrics);
      }

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to analyze lyrics", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }));

  // Beat generation routes
  app.post("/api/beat/generate", withUsageLimit(async (req, res) => {
    try {
      const schema = z.object({
        genre: z.string().min(1),
        bpm: z.number().min(60).max(200),
        duration: z.number().min(1).max(300),
        userId: z.string().optional(),
        aiProvider: z.enum(["openai", "grok", "gemini"]).default("grok")
      });

      const { genre, bpm, duration, userId, aiProvider } = schema.parse(req.body);
      if (aiProvider === "openai" && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured" });
      }
      if (aiProvider === "grok" && !process.env.XAI_API_KEY) {
        return res.status(400).json({ message: "Grok (xAI) API key not configured" });
      }
      if (aiProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ message: "Gemini API key not configured" });
      }
      
      let result: any;
      switch (aiProvider) {
        case "openai":
          result = await generateBeatWithOpenAI(genre, bpm, duration);
          break;
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
  }));

  // CodeBeat fusion routes
  app.post("/api/codebeat/convert", withUsageLimit(async (req, res) => {
    try {
      const schema = z.object({
        code: z.string().min(1),
        language: z.string().min(1),
        userId: z.string().optional(),
        aiProvider: z.enum(["openai", "grok", "gemini"]).default("grok")
      });

      const { code, language, userId, aiProvider } = schema.parse(req.body);
      if (aiProvider === "openai" && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured" });
      }
      if (aiProvider === "grok" && !process.env.XAI_API_KEY) {
        return res.status(400).json({ message: "Grok (xAI) API key not configured" });
      }
      if (aiProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ message: "Gemini API key not configured" });
      }
      
      let result: any;
      switch (aiProvider) {
        case "openai":
          result = await convertCodeToMusicWithOpenAI(code, language);
          break;
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
  }));

  // AI Assistant routes
  app.post("/api/ai/assist", withUsageLimit(async (req, res) => {
    try {
      const schema = z.object({
        question: z.string().min(1),
        context: z.string().optional(),
        aiProvider: z.enum(["openai", "grok", "gemini"]).default("grok")
      });

      const { question, context, aiProvider } = schema.parse(req.body);
      if (aiProvider === "openai" && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured" });
      }
      if (aiProvider === "grok" && !process.env.XAI_API_KEY) {
        return res.status(400).json({ message: "Grok (xAI) API key not configured" });
      }
      if (aiProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ message: "Gemini API key not configured" });
      }
      
      let result: any;
      switch (aiProvider) {
        case "openai":
          result = await getAIAssistanceWithOpenAI(question, context);
          break;
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
  }));

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
