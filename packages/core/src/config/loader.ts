import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { configSchema } from './schema';
import { defaultConfig } from './defaults';
import type { Config } from './types';

function camelCaseKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      result[camelKey] = camelCaseKeys(value);
    }
    return result;
  }
  return obj;
}

export function loadConfig(repoRoot: string, configPath?: string): Config {
  const resolvedPath = resolve(repoRoot, configPath ?? '.github-global.yml');

  let raw: unknown;
  try {
    const content = readFileSync(resolvedPath, 'utf-8');
    raw = camelCaseKeys(parseYaml(content));
  } catch {
    // Config file not found or unparseable: use defaults
    return { ...defaultConfig };
  }

  if (!raw || typeof raw !== 'object') {
    return { ...defaultConfig };
  }

  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid config at ${resolvedPath}:\n${issues}`);
  }

  return parsed.data as Config;
}
