import type { AdapterModel } from "@paperclipai/adapter-utils";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT_MS = 15_000;

interface OpenRouterModel {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  supported_parameters?: string[];
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

interface CachedFreeModels {
  expiresAt: number;
  models: AdapterModel[];
  bestModelId: string | null;
}

const cache = new Map<string, CachedFreeModels>();

// Models known to reject extra fields in tool definitions (e.g. eager_input_streaming)
const TOOL_INCOMPATIBLE_MODELS = new Set([
  "minimax/minimax-m2.5:free",
  "tencent/hy3-preview:free",
]);

function isFreeModel(model: OpenRouterModel): boolean {
  const prompt = model.pricing?.prompt;
  const completion = model.pricing?.completion;
  return prompt === "0" && completion === "0";
}

function supportsTools(model: OpenRouterModel): boolean {
  if (TOOL_INCOMPATIBLE_MODELS.has(model.id)) return false;
  const params = model.supported_parameters;
  if (!params || params.length === 0) return true; // assume compatible if unknown
  return params.includes("tools");
}

async function fetchFreeModels(apiKey: string): Promise<AdapterModel[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API returned ${res.status}: ${res.statusText}`);
    }

    const body = (await res.json()) as OpenRouterModelsResponse;
    const freeModels = (body.data ?? []).filter((m) => isFreeModel(m) && supportsTools(m));

    return freeModels.map((m) => ({
      id: m.id,
      label: m.name ?? m.id,
    }));
  } finally {
    clearTimeout(timeout);
  }
}

export async function getFreeOpenRouterModels(apiKey: string): Promise<AdapterModel[]> {
  const cached = cache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.models;
  }

  const models = await fetchFreeModels(apiKey);
  cache.set(apiKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    models,
    bestModelId: null,
  });
  return models;
}

export async function resolveFreeModel(apiKey: string): Promise<string> {
  const cached = cache.get(apiKey);
  if (cached && cached.expiresAt > Date.now() && cached.bestModelId) {
    return cached.bestModelId;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API returned ${res.status}: ${res.statusText}`);
    }

    const body = (await res.json()) as OpenRouterModelsResponse;
    const freeModels = (body.data ?? []).filter((m) => isFreeModel(m) && supportsTools(m));

    if (freeModels.length === 0) {
      throw new Error("No free models with tool support available on OpenRouter");
    }

    // Pick the model with the largest context window
    freeModels.sort((a, b) => (b.context_length ?? 0) - (a.context_length ?? 0));
    const best = freeModels[0];

    const adapterModels = freeModels.map((m) => ({
      id: m.id,
      label: m.name ?? m.id,
    }));

    cache.set(apiKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      models: adapterModels,
      bestModelId: best.id,
    });

    return best.id;
  } finally {
    clearTimeout(timeout);
  }
}

export function resetFreeModelsCacheForTests() {
  cache.clear();
}
