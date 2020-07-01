export async function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function stall(ms: number = 0): void {
  const start = Date.now()
  while (Date.now() - start < ms);
}

export function safeParseJson(raw: string): any {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return undefined
  }
}
