export function parseAzureSpeechPhrases(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map(phrase => phrase.trim())
        .filter(Boolean),
    ),
  );
}
