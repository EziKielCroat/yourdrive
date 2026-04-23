export type LanguageHint = {
  code: string;
  name: string;
};

const LATIN_WORD_PATTERNS: Array<{ pattern: RegExp; code: string; name: string }> = [
  { pattern: /\b(the|and|is|are|was|were|with|for|have|this|that|from|you|they)\b/i, code: "en", name: "English" },
  { pattern: /\b(je|est|les|des|une|pour|dans|avec|pas|qui|que|nous|vous|ils)\b/i, code: "fr", name: "French" },
  { pattern: /\b(und|ist|das|die|der|ein|mit|für|nicht|aber|sich|auch|haben)\b/i, code: "de", name: "German" },
  { pattern: /\b(que|una|los|las|con|para|por|está|son|pero|como|hay|esto)\b/i, code: "es", name: "Spanish" },
  { pattern: /\b(che|una|gli|con|per|non|del|della|sono|questo|anche|come)\b/i, code: "it", name: "Italian" },
  { pattern: /\b(je|niet|maar|het|van|een|met|zijn|hebben|deze|wordt|worden)\b/i, code: "nl", name: "Dutch" },
  { pattern: /\b(i|nie|się|że|to|na|jest|jak|do|po|ale|czy|też|go)\b/, code: "pl", name: "Polish" },
  { pattern: /\b(je|není|nebo|také|jako|jsou|pro|ale|při|když|aby|toho)\b/i, code: "cs", name: "Czech" },
  {
    pattern: /\b(je|nije|ali|ili|što|koji|koja|koje|kao|zbog|ovaj|ova|ovo|sa|na|za|i|u)\b/,
    code: "hr",
    name: "Croatian",
  },
  { pattern: /\b(og|er|det|som|til|den|ikke|med|for|har|at|de|en|var)\b/i, code: "no", name: "Norwegian" },
  { pattern: /\b(och|är|det|som|till|den|inte|med|för|har|att|de|en|var)\b/i, code: "sv", name: "Swedish" },
  { pattern: /\b(ja|on|se|ei|on|oli|myös|kun|että|tai|kuin|niin)\b/i, code: "fi", name: "Finnish" },
  { pattern: /\b(e|não|uma|para|com|por|que|são|mas|como|isso|este|bem)\b/i, code: "pt", name: "Portuguese" },
];

export function detectLanguage(text: string): LanguageHint {
  const sample = text.slice(0, 600);

  const counts = {
    cyrillic: (sample.match(/[\u0400-\u04FF]/g) ?? []).length,
    arabic: (sample.match(/[\u0600-\u06FF]/g) ?? []).length,
    chinese: (sample.match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) ?? []).length,
    japanese: (sample.match(/[\u3040-\u30FF]/g) ?? []).length,
    korean: (sample.match(/[\uAC00-\uD7AF]/g) ?? []).length,
    devanagari: (sample.match(/[\u0900-\u097F]/g) ?? []).length,
    greek: (sample.match(/[\u0370-\u03FF]/g) ?? []).length,
    latin: (sample.match(/[a-zA-Z]/g) ?? []).length,
  };

  const maxNonLatin = Math.max(
    counts.cyrillic,
    counts.arabic,
    counts.chinese,
    counts.japanese,
    counts.korean,
    counts.devanagari,
    counts.greek,
  );

  if (maxNonLatin > 6 && maxNonLatin > counts.latin * 0.3) {
    if (counts.japanese >= maxNonLatin) return { code: "ja", name: "Japanese" };
    if (counts.chinese >= maxNonLatin) return { code: "zh", name: "Chinese" };
    if (counts.korean >= maxNonLatin) return { code: "ko", name: "Korean" };
    if (counts.arabic >= maxNonLatin) return { code: "ar", name: "Arabic" };
    if (counts.devanagari >= maxNonLatin) return { code: "hi", name: "Hindi" };
    if (counts.greek >= maxNonLatin) return { code: "el", name: "Greek" };
    if (counts.cyrillic >= maxNonLatin) return { code: "ru", name: "Russian" };
  }

  let bestMatch: LanguageHint = { code: "en", name: "English" };
  let bestScore = 0;

  for (const { pattern, code, name } of LATIN_WORD_PATTERNS) {
    const matches = sample.match(new RegExp(pattern.source, pattern.flags + "g")) ?? [];
    if (matches.length > bestScore) {
      bestScore = matches.length;
      bestMatch = { code, name };
    }
  }

  return bestMatch;
}

export function buildSystemPromptWithLanguage(
  basePrompt: string,
  userText: string,
): string {
  const lang = detectLanguage(userText);
  if (lang.code === "en") return basePrompt;
  return `${basePrompt}\n\nIMPORTANT: The user is writing in ${lang.name}. Respond entirely in ${lang.name}.`;
}
