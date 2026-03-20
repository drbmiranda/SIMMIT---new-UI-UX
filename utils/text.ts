export const decodeMojibakeText = (input: string): string => {
  let output = input;
  const mojibakePattern = /[\u00C3\u00C2\uFFFD]/g;
  const score = (value: string) => (value.match(mojibakePattern) || []).length;

  for (let i = 0; i < 3; i += 1) {
    if (!mojibakePattern.test(output)) break;
    try {
      const candidate = decodeURIComponent(escape(output));
      if (score(candidate) < score(output)) output = candidate;
      else break;
    } catch {
      break;
    }
  }

  return output;
};

export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return decodeMojibakeText(String(text))
    .replace(/\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\*/g, '')
    .replace(/\s{3,}/g, '  ')
    .trim();
};

export const sanitizeTextArray = (items: Array<string | null | undefined>): string[] => items.map((item) => sanitizeText(item));
