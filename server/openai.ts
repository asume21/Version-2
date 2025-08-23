import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function translateCode(
  sourceCode: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translatedCode: string; explanation: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert code translator. Translate code from ${sourceLanguage} to ${targetLanguage} while maintaining functionality and best practices. Respond with JSON in this format: { "translatedCode": "string", "explanation": "string" }`
        },
        {
          role: "user",
          content: `Translate this ${sourceLanguage} code to ${targetLanguage}:\n\n${sourceCode}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      translatedCode: result.translatedCode || "",
      explanation: result.explanation || ""
    };
  } catch (error) {
    throw new Error("Failed to translate code: " + (error as Error).message);
  }
}

export async function planAssistantAction(
  question: string,
  context: string = ""
): Promise<{ intent: "answer" | "translate_code" | "generate_lyrics" | "generate_beat" | "code_to_music" | "pro_audio" | "analyze_lyrics" | "rhyme_suggestions" | "syllable_count" | "rhyme_scheme"; parameters: Record<string, any>; rationale: string }> {
  const systemPrompt = `You are a planner for an AI assistant that can perform the following actions:
Actions:
- answer: Provide a direct helpful answer. Parameters: {}
- translate_code: Translate code between languages. Parameters: { sourceCode: string, sourceLanguage: string, targetLanguage: string }
- generate_lyrics: Create song lyrics. Parameters: { prompt: string, genre?: string, mood?: string }
- generate_beat: Create a beat pattern. Parameters: { genre: string, bpm?: number, duration?: number }
- code_to_music: Convert code to music. Parameters: { code: string, language: string }
- pro_audio: Generate a professional full song. Parameters: { prompt: string, options?: { genre?: string, mood?: string, duration?: number, style?: string, instruments?: string[], vocals?: boolean, bpm?: number, key?: string } }
 - analyze_lyrics: Analyze lyrics. Parameters: { lyrics: string }
 - rhyme_suggestions: Suggest rhymes for a word. Parameters: { word: string }
 - syllable_count: Count syllables (per line). Parameters: { lyrics: string }
 - rhyme_scheme: Detect rhyme scheme. Parameters: { lyrics: string }

Given the user's message and optional context, pick the single best intent and extract parameters if the user provided enough details. If details are missing, choose "answer" and explain what info is needed.

Respond with JSON: { "intent": "answer|translate_code|generate_lyrics|generate_beat|code_to_music|pro_audio|analyze_lyrics|rhyme_suggestions|syllable_count|rhyme_scheme", "parameters": { ... }, "rationale": "string" }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt + (context ? `\nContext: ${context}` : "") },
      { role: "user", content: question }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return {
    intent: result.intent || "answer",
    parameters: result.parameters || {},
    rationale: result.rationale || ""
  };
}

export async function generateLyrics(
  prompt: string,
  genre?: string,
  mood?: string
): Promise<{ lyrics: string; rhymeScheme: string; sentiment: string }> {
  try {
    const systemPrompt = `You are a creative lyricist. Generate song lyrics based on the prompt. ${genre ? `Genre: ${genre}.` : ""} ${mood ? `Mood: ${mood}.` : ""} Respond with JSON in this format: { "lyrics": "string", "rhymeScheme": "string", "sentiment": "string" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      lyrics: result.lyrics || "",
      rhymeScheme: result.rhymeScheme || "",
      sentiment: result.sentiment || ""
    };
  } catch (error) {
    throw new Error("Failed to generate lyrics: " + (error as Error).message);
  }
}

export async function analyzeLyrics(
  lyrics: string
): Promise<{ sentiment: string; themes: string[]; rhymeScheme: string; complexity: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a lyrics analyzer. Analyze the given lyrics for sentiment, themes, rhyme scheme, and complexity (1-10). Respond with JSON in this format: { \"sentiment\": \"string\", \"themes\": [\"string\"], \"rhymeScheme\": \"string\", \"complexity\": number }"
        },
        {
          role: "user",
          content: `Analyze these lyrics:\n\n${lyrics}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      sentiment: result.sentiment || "neutral",
      themes: result.themes || [],
      rhymeScheme: result.rhymeScheme || "unknown",
      complexity: Math.max(1, Math.min(10, result.complexity || 5))
    };
  } catch (error) {
    throw new Error("Failed to analyze lyrics: " + (error as Error).message);
  }
}

export async function getRhymesWithOpenAI(
  word: string
): Promise<{ rhymes: string[]; nearRhymes: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an English rhyme dictionary. Given a word, return two arrays: exact rhymes (same stressed vowel and ending) and near rhymes (assonance/consonance). Respond ONLY with JSON: { \"rhymes\": [\"string\"], \"nearRhymes\": [\"string\"] }",
        },
        { role: "user", content: `Word: ${word}` },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      rhymes: Array.isArray(result.rhymes) ? result.rhymes : [],
      nearRhymes: Array.isArray(result.nearRhymes) ? result.nearRhymes : [],
    };
  } catch (error) {
    throw new Error("Failed to fetch rhymes: " + (error as Error).message);
  }
}

export async function generateBeatPattern(
  genre: string,
  bpm: number,
  duration: number
): Promise<{ pattern: number[]; samples: string[]; description: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a music producer. Generate a beat pattern for ${genre} music at ${bpm} BPM for ${duration} seconds. Respond with JSON in this format: { "pattern": [1,0,1,0...], "samples": ["kick", "snare", "hihat"], "description": "string" }`
        },
        {
          role: "user",
          content: `Create a ${genre} beat pattern at ${bpm} BPM for ${duration} seconds`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      pattern: result.pattern || [1, 0, 1, 0, 1, 0, 1, 0],
      samples: result.samples || ["kick", "snare", "hihat"],
      description: result.description || ""
    };
  } catch (error) {
    throw new Error("Failed to generate beat pattern: " + (error as Error).message);
  }
}

export async function codeToMusic(
  code: string,
  language: string
): Promise<{ melody: number[]; rhythm: number[]; key: string; tempo: number; description: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a CodeBeat artist. Convert code into musical elements. Analyze the code structure, complexity, and patterns to generate musical representations. Respond with JSON in this format: { "melody": [60,62,64...], "rhythm": [1,0,1,0...], "key": "C", "tempo": 120, "description": "string" }`
        },
        {
          role: "user",
          content: `Convert this ${language} code to music:\n\n${code}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      melody: result.melody || [60, 62, 64, 65],
      rhythm: result.rhythm || [1, 0, 1, 0],
      key: result.key || "C",
      tempo: Math.max(60, Math.min(200, result.tempo || 120)),
      description: result.description || ""
    };
  } catch (error) {
    throw new Error("Failed to convert code to music: " + (error as Error).message);
  }
}

export async function getAIAssistance(
  question: string,
  context?: string
): Promise<{ answer: string; suggestions: string[] }> {
  try {
    const systemPrompt = `You are a helpful AI assistant specialized in coding and music creation. Provide clear, actionable answers and suggestions. ${context ? `Context: ${context}` : ""} Respond with JSON in this format: { "answer": "string", "suggestions": ["string"] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: question
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      answer: result.answer || "",
      suggestions: result.suggestions || []
    };
  } catch (error) {
    throw new Error("Failed to get AI assistance: " + (error as Error).message);
  }
}
