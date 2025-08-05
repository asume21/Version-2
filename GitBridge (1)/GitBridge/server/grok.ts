import OpenAI from "openai";

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export async function translateCodeWithGrok(sourceCode: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following ${sourceLanguage} code to ${targetLanguage}. Only return the translated code without explanations:

${sourceCode}`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "Translation failed";
}

export async function generateLyricsWithGrok(prompt: string, mood: string = "neutral", genre: string = "pop"): Promise<string> {
  const systemPrompt = `You are a talented and witty lyricist with Grok's signature humor and creativity. Generate lyrics based on the given prompt with the specified mood and genre.
Mood: ${mood}
Genre: ${genre}

Generate complete song lyrics with verses, chorus, and bridge sections. Add some clever wordplay and unexpected twists that make the lyrics memorable.`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content || "Lyric generation failed";
}

export interface BeatPattern {
  pattern: number[];
  tempo: number;
  samples: string[];
  description: string;
}

export async function generateBeatWithGrok(style: string, tempo: number = 120): Promise<BeatPattern> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are a music producer with Grok's creative flair. Generate a beat pattern for the style "${style}" at ${tempo} BPM.
Return a JSON object with:
- pattern: array of 16 numbers (0 or 1) representing the beat pattern
- tempo: the BPM
- samples: array of drum sample names
- description: brief description of the beat with some witty commentary

Respond with JSON in this format: { "pattern": [array], "tempo": number, "samples": [array], "description": "string" }`,
        },
        {
          role: "user",
          content: `Generate a ${style} beat at ${tempo} BPM`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      pattern: Array.isArray(result.pattern) ? result.pattern : [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      tempo: typeof result.tempo === 'number' ? result.tempo : tempo,
      samples: Array.isArray(result.samples) ? result.samples : ["kick", "snare", "hihat"],
      description: typeof result.description === 'string' ? result.description : `A groovy ${style} beat at ${tempo} BPM`,
    };
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

export async function convertCodeToMusicWithGrok(code: string, language: string): Promise<MusicResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are a creative AI with Grok's innovative thinking that converts code structures into musical patterns.
Analyze the given ${language} code and convert it to music by:
- Converting variable names, function calls, and structure into melody notes (MIDI numbers 60-84)
- Converting loops, conditions, and flow control into rhythm patterns (0s and 1s)
- Determining musical key and tempo based on code complexity
- Add some creative interpretation that makes the music interesting

Return JSON with:
- melody: array of MIDI note numbers (60-84)
- rhythm: array of 0s and 1s for rhythm pattern
- tempo: BPM based on code complexity
- key: musical key (like "C major", "A minor")
- description: explanation of the conversion process with some witty observations

Respond with JSON in this format: { "melody": [array], "rhythm": [array], "tempo": number, "key": "string", "description": "string" }`,
        },
        {
          role: "user",
          content: `Convert this ${language} code to music:\n\n${code}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      melody: Array.isArray(result.melody) ? result.melody : [60, 62, 64, 65, 67, 69, 71, 72],
      rhythm: Array.isArray(result.rhythm) ? result.rhythm : [1,0,1,0,1,0,1,0],
      tempo: typeof result.tempo === 'number' ? result.tempo : 120,
      key: typeof result.key === 'string' ? result.key : "C major",
      description: typeof result.description === 'string' ? result.description : "A musical interpretation of your code",
    };
  } catch (error) {
    throw new Error(`Failed to convert code to music: ${error}`);
  }
}

export async function getAIAssistanceWithGrok(message: string, context: string = ""): Promise<string> {
  const systemPrompt = `You are Grok, an AI assistant with wit, humor, and deep knowledge of both programming and music creation.
Help users with coding questions, music theory, creative projects, and the intersection of technology and music.
Be helpful, creative, and don't be afraid to add some humor and personality to your responses.
You're like having a brilliant, slightly sarcastic friend who happens to know everything about code and music.

${context ? `Context: ${context}` : ""}`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
  });

  return response.choices[0].message.content || "I'm having trouble responding right now. Please try again.";
}