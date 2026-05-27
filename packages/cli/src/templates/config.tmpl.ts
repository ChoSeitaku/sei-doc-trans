export function generateConfigYaml(opts: {
  baseline?: string;
  targets?: string[];
  provider?: string;
  model?: string;
  apiKeyEnv?: string;
}): string {
  const baseline = opts.baseline ?? 'zh';
  const targets = opts.targets ?? ['en', 'ja', 'ko', 'es', 'fr'];
  const provider = opts.provider ?? 'deepseek';
  const model = opts.model ?? 'deepseek-chat';
  const apiKeyEnv = opts.apiKeyEnv ?? 'DEEPSEEK_API_KEY';

  return `# github-global configuration
# See: https://github.com/github-global/github-global

# Source (baseline) language
baseline: ${baseline}

# Target languages
targets:
${targets.map((t) => `  - ${t}`).join('\n')}

# Files to translate (glob patterns relative to repo root)
include:
  - README.md
  - docs/**/*.md
  - docs/**/*.mdx

# Files to exclude
exclude:
  - docs/**/CHANGELOG.md
  - docs/api-reference/**

# Output path template
# {lang} = target language code, {path} = relative path to source file
output: docs/{lang}/{path}
output_readme: README.{lang}.md

# LLM provider configuration
provider:
  name: ${provider}                     # openai | anthropic | deepseek | qwen | zhipu
  model: ${model}
  api_key_env: ${apiKeyEnv}
  max_concurrency: 5                    # max parallel LLM calls
  timeout_ms: 30000

# Translation options
options:
  chunk_size: 2000                      # max chars per translation chunk
  preserve_frontmatter_keys: true
  translate_frontmatter_values:
    - title
    - description
    - keywords
  glossary_path: .github-global/glossary.yml
  retry:
    max_attempts: 3
    backoff_ms: 1000

# Cache configuration
cache:
  path: .github-global/cache.json
  enabled: true
`;
}
