const browserGlobals = globalThis as typeof globalThis & {
  global?: typeof globalThis;
  process?: { env: Record<string, string | undefined> };
};

browserGlobals.global ??= globalThis;
browserGlobals.process ??= { env: {} };
