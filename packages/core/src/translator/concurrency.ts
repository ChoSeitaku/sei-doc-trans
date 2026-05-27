import pLimit from 'p-limit';

export function createConcurrencyLimiter(maxConcurrency: number) {
  return pLimit(Math.max(1, maxConcurrency));
}

export async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  maxConcurrency: number,
): Promise<void> {
  const limit = createConcurrencyLimiter(maxConcurrency);
  await Promise.all(items.map((item) => limit(() => fn(item))));
}
