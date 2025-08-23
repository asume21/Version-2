// Lightweight lyric helper utilities: syllables, rhyme keys/schemes, metrics, and heuristic rhyme suggestions
// English-focused heuristics with graceful fallbacks.

const VOWELS = "aeiouy";

function cleanWord(word: string): string {
  return (word || "").toLowerCase().replace(/[^a-z']/g, "").replace(/^'+|'+$/g, "");
}

// Basic heuristic syllable counter (English). Not perfect but serviceable.
export function countSyllablesWord(raw: string): number {
  const word = cleanWord(raw);
  if (!word) return 0;
  // Very short words
  if (word.length <= 3) return 1;

  // Remove silent trailing 'e' (but not 'le' endings like "table")
  const endsWithLE = /[b-df-hj-np-tv-z]le$/.test(word);
  const base = endsWithLE ? word : word.replace(/e$/, "");

  // Count vowel groups
  const groups = base.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;

  // Adjust for some common endings adding syllables
  if (endsWithLE) count += 1; // handle 'table', 'candle'

  // Collapse some over-counts for -es/-ed that are often not syllabic
  if (/[^aeiouy][aeiouy][^aeiouy]ed$/.test(word)) count -= 1; // "walked", "talked"
  if (/[^s]es$/.test(word) && !/(oses|eses)$/.test(word)) count -= 1; // "fixes" often 2 not 3

  // Minimum 1 syllable
  return Math.max(1, count);
}

export function countSyllablesLine(line: string): { words: string[]; perWord: number[]; syllables: number } {
  const words = (line.match(/[A-Za-z']+/g) || []).map(cleanWord).filter(Boolean);
  const perWord = words.map(countSyllablesWord);
  const syllables = perWord.reduce((a, b) => a + b, 0);
  return { words, perWord, syllables };
}

export function countSyllablesText(text: string): {
  total: number;
  perLine: { line: string; words: string[]; perWord: number[]; syllables: number }[];
} {
  const lines = text.split(/\r?\n/);
  const perLine = lines.map((line) => ({ line, ...countSyllablesLine(line) }));
  const total = perLine.reduce((a, b) => a + b.syllables, 0);
  return { total, perLine };
}

// Rhyme key: last vowel group to end (approximate rhyme nucleus+coda)
export function rhymeKey(rawWord: string): string {
  const w = cleanWord(rawWord);
  if (!w) return "";
  // Find last vowel index
  for (let i = w.length - 1; i >= 0; i--) {
    if (VOWELS.includes(w[i])) {
      return w.slice(i);
    }
  }
  // Fallback to last 2 letters
  return w.slice(-2);
}

// Detect rhyme scheme: A, B, C... mapping by rhymeKey per non-empty line
export function detectRhymeScheme(lyrics: string): { scheme: string; labels: string[]; keys: string[] } {
  const lines = lyrics.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const keys = lines.map((l) => rhymeKey((l.trim().split(/\s+/).pop() || "")));
  const map = new Map<string, string>();
  let next = 65; // 'A'
  const labels = keys.map((k) => {
    const key = k || `line-${Math.random().toString(36).slice(2, 6)}`;
    if (!map.has(key)) map.set(key, String.fromCharCode(next++));
    return map.get(key)!;
  });
  return { scheme: labels.join(""), labels, keys };
}

export function getLineMetrics(lyrics: string): {
  perLine: { line: string; syllables: number; words: string[]; perWord: number[]; lastWord: string; rhymeKey: string; label: string }[];
  averages: { syllables: number };
} {
  const lines = lyrics.split(/\r?\n/);
  const notEmpty = lines.map((l) => l.trim()).filter(Boolean);
  const { labels, keys } = detectRhymeScheme(notEmpty.join("\n"));

  let labelIdx = 0;
  const perLine = lines.map((line) => {
    if (!line.trim()) return { line, syllables: 0, words: [], perWord: [], lastWord: "", rhymeKey: "", label: "" };
    const { words, perWord, syllables } = countSyllablesLine(line);
    const lastWord = (line.trim().split(/\s+/).pop() || "");
    const key = rhymeKey(lastWord);
    const label = labels[labelIdx] || "";
    labelIdx++;
    return { line, syllables, words, perWord, lastWord, rhymeKey: key, label };
  });

  const syllSum = perLine.reduce((a, b) => a + b.syllables, 0);
  const lineCount = perLine.filter((l) => l.line.trim().length > 0).length || 1;
  return { perLine, averages: { syllables: Math.round((syllSum / lineCount) * 10) / 10 } };
}

// Simple heuristic rhyme suggestions by suffix patterns. If no pattern matches, try same last vowel group suffix.
const RHYME_PATTERNS: Record<string, string[]> = {
  ight: ["light","night","sight","bright","flight","might","right","tight","fight","blight","knight","fright"],
  ain: ["rain","pain","gain","chain","main","brain","train","strain","plain","drain"],
  ake: ["make","take","bake","wake","fake","lake","shake","stake","quake","flake"],
  ow: ["flow","glow","snow","grow","show","know","blow","throw","slow","below"],
  old: ["cold","gold","bold","told","sold","hold","fold","scold","mold","behold"],
  ore: ["more","core","store","shore","before","ignore","explore","roar","floor","score"],
  air: ["air","care","share","fair","flare","glare","stare","pair","chair","affair"],
  ee: ["see","free","tree","be","flee","agree","knee","three","glee","sea"],
  ay: ["day","play","say","way","stay","gray","clay","spray","delay","relay"],
  oon: ["moon","tune","soon","boon","noon","spoon","balloon","cocoon","swoon","cartoon"],
  ime: ["time","rhyme","climb","prime","chime","slime","sublime","overtime","sometime"],
  all: ["fall","call","all","ball","tall","wall","small","stall","install"],
  ue: ["blue","true","cue","glue","due","chew","threw","grew","view","few"],
  ine: ["line","shine","fine","mine","wine","sign","design","align","divine","combine"],
  art: ["heart","start","part","cart","smart","chart","apart","dart","tart"],
};

export function suggestRhymes(word: string, max: number = 20): string[] {
  const w = cleanWord(word);
  if (!w) return [];
  const key = rhymeKey(w);

  // Try direct pattern table
  const direct = RHYME_PATTERNS[key as keyof typeof RHYME_PATTERNS];
  let candidates = direct ? [...direct] : [];

  // Fallback: match by same ending against all pattern lists
  if (candidates.length === 0) {
    const allWords = new Set<string>();
    Object.values(RHYME_PATTERNS).forEach((arr) => arr.forEach((x) => allWords.add(x)));
    const suffix = key.length >= 2 ? key.slice(-2) : key;
    const more = Array.from(allWords).filter((w2) => w2.endsWith(suffix));
    candidates = more;
  }

  // Remove the original word if present and de-duplicate
  const unique = Array.from(new Set(candidates.filter((x) => x !== w)));
  return unique.slice(0, max);
}
