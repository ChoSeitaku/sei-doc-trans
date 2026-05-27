import chalk from 'chalk';

export function success(msg: string): void {
  console.log(chalk.green('✓ ') + msg);
}

export function info(msg: string): void {
  console.log(chalk.blue('ℹ ') + msg);
}

export function warn(msg: string): void {
  console.warn(chalk.yellow('⚠ ') + msg);
}

export function error(msg: string): void {
  console.error(chalk.red('✗ ') + msg);
}

export function heading(msg: string): void {
  console.log('\n' + chalk.bold.underline(msg));
}

export function kv(key: string, value: string): void {
  console.log(`  ${chalk.gray(key + ':')} ${chalk.white(value)}`);
}

export function divider(): void {
  console.log(chalk.gray('─'.repeat(60)));
}
