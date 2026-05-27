export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
  setLevel(level: LogLevel): void;
}

export function createLogger(level: LogLevel = 'info'): Logger {
  let currentLevel = LEVELS[level];

  function log(lvl: LogLevel, msg: string, data?: Record<string, unknown>) {
    if (LEVELS[lvl] < currentLevel) return;
    const prefix = `[${lvl.toUpperCase()}]`;
    const dataStr = data ? ' ' + JSON.stringify(data) : '';
    if (lvl === 'error') {
      console.error(`${prefix} ${msg}${dataStr}`);
    } else if (lvl === 'warn') {
      console.warn(`${prefix} ${msg}${dataStr}`);
    } else {
      console.log(`${prefix} ${msg}${dataStr}`);
    }
  }

  return {
    debug: (msg, data) => log('debug', msg, data),
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
    setLevel: (lvl) => {
      currentLevel = LEVELS[lvl];
    },
  };
}
