const MOJIBAKE_MARKERS = ['\u00C3', '\u00C2', '\u00E2', '\uFFFD'].map((value) => JSON.parse(`"${value}"`));
const NBSP = JSON.parse('"\u00A0"');

const hasMojibake = (value: string) => MOJIBAKE_MARKERS.some((marker) => value.includes(marker));
const scoreMojibake = (value: string) => MOJIBAKE_MARKERS.reduce((total, marker) => total + value.split(marker).length - 1, 0);

const decodeLatin1AsUtf8 = (value: string): string => {
  try {
    const bytes = Uint8Array.from(Array.from(value).map((char) => char.charCodeAt(0) & 0xff));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return value;
  }
};

const decodeURIComponentEscape = (value: string): string => {
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const fixCommonArtifacts = (value: string): string =>
  value
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')
    .replace(/\u00e2\u20ac\u0153/g, '\u201c')
    .replace(/\u00e2\u20ac\u009d/g, '\u201d')
    .replace(/\u00e2\u20ac\u201c/g, '\u2013')
    .replace(/\u00e2\u20ac\u201d/g, '\u2014')
    .replace(/\u00e2\u20ac\u00a6/g, '...')
    .replace(/\u00c2\u00a0/g, ' ')
    .replace(new RegExp(NBSP, 'g'), ' ')
    .replace(/\uFFFD/g, '');

export const decodeMojibakeText = (input: string): string => {
  let output = input;

  for (let i = 0; i < 4; i += 1) {
    if (!hasMojibake(output)) break;

    const candidates = [
      output,
      decodeURIComponentEscape(output),
      decodeLatin1AsUtf8(output),
      fixCommonArtifacts(output),
      fixCommonArtifacts(decodeLatin1AsUtf8(output)),
      fixCommonArtifacts(decodeURIComponentEscape(output)),
    ];

    const best = candidates.reduce(
      (winner, candidate) => (scoreMojibake(candidate) < scoreMojibake(winner) ? candidate : winner),
      output,
    );

    if (best === output) break;
    output = best;
  }

  return fixCommonArtifacts(output);
};

const decodeUnicodeEscapes = (value: string): string =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';

  let output = String(text);
  for (let i = 0; i < 3; i += 1) {
    const decodedUnicode = decodeUnicodeEscapes(output);
    const decodedMojibake = decodeMojibakeText(decodedUnicode);
    if (decodedMojibake === output) break;
    output = decodedMojibake;
  }

  return output
    .replace(/\*/g, '')
    .replace(/\s{3,}/g, '  ')
    .trim();
};

export const sanitizeTextArray = (items: Array<string | null | undefined>): string[] => items.map((item) => sanitizeText(item));
