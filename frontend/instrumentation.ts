export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startCasesWarmup } = await import("./lib/server/chain");
  startCasesWarmup();
}
