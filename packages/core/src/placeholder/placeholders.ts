let counter = 0;

export function resetCounter(): void {
  counter = 0;
}

export function nextTag(type: string): string {
  const num = String(++counter).padStart(3, '0');
  return `[[${type}_${num}]]`;
}

export const PLACEHOLDER_PATTERN = /\[\[([A-Z]+)_(\d{3})\]\]/g;
