export async function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
