import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateCodeWithGemini(sourceCode: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following ${sourceLanguage} code to ${targetLanguage}. Only return the translated code without explanations:

${sourceCode}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text || "Translation failed";
}

export async function generateLyricsWithGemini(prompt: string, mood: string = "neutral", genre: string = "pop"): Promise<string> {
    const systemPrompt = `You are a talented lyricist. Generate lyrics based on the given prompt with the specified mood and genre.
Mood: ${mood}
Genre: ${genre}

Generate complete song lyrics with verses, chorus, and bridge sections.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
            systemInstruction: systemPrompt,
        },
        contents: prompt,
    });

    return response.text || "Lyric generation failed";
}

export interface BeatPattern {
    pattern: number[];
    tempo: number;
    samples: string[];
    description: string;
}

export async function generateBeatWithGemini(style: string, tempo: number = 120): Promise<BeatPattern> {
    try {
        const systemPrompt = `You are a music producer. Generate a beat pattern for the style "${style}" at ${tempo} BPM.
Return a JSON object with:
- pattern: array of 16 numbers (0 or 1) representing the beat pattern
- tempo: the BPM
- samples: array of drum sample names
- description: brief description of the beat

Respond with valid JSON only.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        pattern: { type: "array", items: { type: "number" } },
                        tempo: { type: "number" },
                        samples: { type: "array", items: { type: "string" } },
                        description: { type: "string" },
                    },
                    required: ["pattern", "tempo", "samples", "description"],
                },
            },
            contents: `Generate a ${style} beat at ${tempo} BPM`,
        });

        const rawJson = response.text;
        if (rawJson) {
            const data: BeatPattern = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        throw new Error(`Failed to generate beat: ${error}`);
    }
}

export interface MusicResult {
    melody: number[];
    rhythm: number[];
    tempo: number;
    key: string;
    description: string;
}

export async function convertCodeToMusicWithGemini(code: string, language: string): Promise<MusicResult> {
    try {
        const systemPrompt = `You are a creative AI that converts code structures into musical patterns.
Analyze the given ${language} code and convert it to music by:
- Converting variable names, function calls, and structure into melody notes (MIDI numbers 60-84)
- Converting loops, conditions, and flow control into rhythm patterns (0s and 1s)
- Determining musical key and tempo based on code complexity

Return JSON with:
- melody: array of MIDI note numbers (60-84)
- rhythm: array of 0s and 1s for rhythm pattern
- tempo: BPM based on code complexity
- key: musical key (like "C major", "A minor")
- description: explanation of the conversion process

Respond with valid JSON only.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        melody: { type: "array", items: { type: "number" } },
                        rhythm: { type: "array", items: { type: "number" } },
                        tempo: { type: "number" },
                        key: { type: "string" },
                        description: { type: "string" },
                    },
                    required: ["melody", "rhythm", "tempo", "key", "description"],
                },
            },
            contents: `Convert this ${language} code to music:\n\n${code}`,
        });

        const rawJson = response.text;
        if (rawJson) {
            const data: MusicResult = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        throw new Error(`Failed to convert code to music: ${error}`);
    }
}

export async function getAIAssistanceWithGemini(message: string, context: string = ""): Promise<string> {
    const systemPrompt = `You are an AI assistant specialized in both programming and music creation. 
Help users with coding questions, music theory, creative projects, and the intersection of technology and music.
Be helpful, creative, and provide practical advice.

${context ? `Context: ${context}` : ""}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
            systemInstruction: systemPrompt,
        },
        contents: message,
    });

    return response.text || "I'm having trouble responding right now. Please try again.";
}