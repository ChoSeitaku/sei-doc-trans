import { input, select, checkbox } from '@inquirer/prompts';

export interface InitAnswers {
  baseline: string;
  targets: string[];
  provider: string;
  model: string;
  apiKeyEnv: string;
}

export async function promptInit(defaults: Partial<InitAnswers>): Promise<InitAnswers> {
  const baseline = await input({
    message: 'Source (baseline) language code:',
    default: defaults.baseline ?? 'zh',
  });

  const targets = await checkbox({
    message: 'Target languages to translate into:',
    choices: [
      { name: 'English (en)', value: 'en', checked: true },
      { name: 'Japanese (ja)', value: 'ja', checked: true },
      { name: 'Korean (ko)', value: 'ko', checked: true },
      { name: 'Spanish (es)', value: 'es', checked: true },
      { name: 'French (fr)', value: 'fr', checked: true },
      { name: 'German (de)', value: 'de', checked: false },
      { name: 'Portuguese (pt)', value: 'pt', checked: false },
    ],
  });

  const provider = await select({
    message: 'LLM provider:',
    choices: [
      { name: 'DeepSeek (recommended for Chinese)', value: 'deepseek' },
      { name: 'OpenAI', value: 'openai' },
      { name: 'Anthropic Claude', value: 'anthropic' },
      { name: 'Qwen / 通义千问', value: 'qwen' },
      { name: 'Zhipu / 智谱 GLM', value: 'zhipu' },
    ],
    default: 'deepseek',
  });

  const defaultModels: Record<string, string> = {
    deepseek: 'deepseek-chat',
    openai: 'gpt-4o',
    anthropic: 'claude-sonnet-4-6',
    qwen: 'qwen-plus',
    zhipu: 'glm-4-flash',
  };

  const model = await input({
    message: 'Model name:',
    default: defaultModels[provider] ?? 'deepseek-chat',
  });

  const defaultApiKeyEnvs: Record<string, string> = {
    deepseek: 'DEEPSEEK_API_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    qwen: 'QWEN_API_KEY',
    zhipu: 'ZHIPU_API_KEY',
  };

  const apiKeyEnv = await input({
    message: 'Environment variable name for API key:',
    default: defaultApiKeyEnvs[provider] ?? 'API_KEY',
  });

  return { baseline, targets, provider, model, apiKeyEnv };
}
