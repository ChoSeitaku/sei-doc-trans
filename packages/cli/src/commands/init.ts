import { writeFileSync, existsSync, mkdirSync, appendFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { generateConfigYaml } from '../templates/config.tmpl';
import { generateWorkflowYaml } from '../templates/workflow.tmpl';
import { generateGlossaryYaml } from '../templates/glossary.tmpl';
import { promptInit } from '../ui/prompts';
import { success, info, heading } from '../ui/output';

export interface InitOptions {
  yes?: boolean;
  configDir?: string;
}

export async function initCommand(opts: InitOptions): Promise<void> {
  const dir = resolve(opts.configDir ?? '.');

  const answers = opts.yes
    ? { baseline: 'zh', targets: ['en', 'ja', 'ko', 'es', 'fr'], provider: 'deepseek', model: 'deepseek-chat', apiKeyEnv: 'DEEPSEEK_API_KEY' }
    : await promptInit({
        baseline: 'zh',
        targets: ['en', 'ja', 'ko', 'es', 'fr'],
        provider: 'deepseek',
        model: 'deepseek-chat',
        apiKeyEnv: 'DEEPSEEK_API_KEY',
      });

  heading('Initializing github-global');

  // 1. Write config
  const configPath = resolve(dir, '.github-global.yml');
  const configYaml = generateConfigYaml(answers);
  writeFileSync(configPath, configYaml, 'utf-8');
  success(`Created ${configPath}`);

  // 2. Write workflow
  const workflowDir = resolve(dir, '.github/workflows');
  if (!existsSync(workflowDir)) {
    mkdirSync(workflowDir, { recursive: true });
  }
  const workflowPath = resolve(workflowDir, 'translate.yml');
  writeFileSync(workflowPath, generateWorkflowYaml(), 'utf-8');
  success(`Created ${workflowPath}`);

  // 3. Write glossary template
  const glossaryDir = resolve(dir, '.github-global');
  if (!existsSync(glossaryDir)) {
    mkdirSync(glossaryDir, { recursive: true });
  }
  const glossaryPath = resolve(glossaryDir, 'glossary.yml');
  writeFileSync(glossaryPath, generateGlossaryYaml(), 'utf-8');
  success(`Created ${glossaryPath}`);

  // 4. Update .gitignore
  const gitignorePath = resolve(dir, '.gitignore');
  const gitignoreEntry = '\n# github-global\n.github-global/log/\n';
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8');
    if (!content.includes('.github-global/log/')) {
      appendFileSync(gitignorePath, gitignoreEntry);
      success('Updated .gitignore');
    }
  } else {
    writeFileSync(gitignorePath, gitignoreEntry.trim() + '\n');
    success('Created .gitignore');
  }

  console.log('');
  info('Setup complete! Next steps:');
  console.log('  1. Set your API key: export ' + answers.apiKeyEnv + '=your-key');
  console.log('  2. Run: npx github-global translate --dry-run  (to test)');
  console.log('  3. Run: npx github-global translate            (to start translating)');
  console.log('  4. Commit and push to trigger auto-translation via GitHub Actions');
}
