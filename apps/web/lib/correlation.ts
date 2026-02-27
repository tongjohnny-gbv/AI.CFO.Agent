export function correlationId(seed?: string) {
  return seed ?? `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
