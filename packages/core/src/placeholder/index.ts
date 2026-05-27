export { extractPlaceholders } from './extractor';
export { serializeWithPlaceholders } from './replacer';
export { restorePlaceholders, detectResidualPlaceholders, hasResidualPlaceholders } from './restorer';
export { resetCounter, PLACEHOLDER_PATTERN } from './placeholders';
export type { PlaceholderMap, PlaceholderEntry, PlaceholderTag } from './types';
