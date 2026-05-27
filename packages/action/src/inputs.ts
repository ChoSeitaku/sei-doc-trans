import { getInput, getBooleanInput } from '@actions/core';

export interface ActionInputs {
  configPath: string;
  provider: string;
  onlyChanged: boolean;
  failOnError: boolean;
}

export function parseInputs(): ActionInputs {
  return {
    configPath: getInput('config-path') || '.github-global.yml',
    provider: getInput('provider') || '',
    onlyChanged: getBooleanInput('only-changed') || true,
    failOnError: getBooleanInput('fail-on-error') || false,
  };
}
