export interface RetryOptions {
  maxAttempts: number;
  backoffMs: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions,
): Promise<T> {
  const { maxAttempts, backoffMs, jitter = true, shouldRetry } = opts;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      if (shouldRetry && !shouldRetry(err)) throw err;

      const delay = jitter
        ? backoffMs * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5)
        : backoffMs * Math.pow(2, attempt - 1);

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
