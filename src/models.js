// Comprehensive model mapping from the Python implementation
export const MODELS_CONFIG = {
  // OpenAI Models
  'gpt-4o': { name: 'gpt-4o', provider: 'openai', vision: true },
  'gpt-4o-2024-11-20': { name: 'gpt-4o-2024-11-20', provider: 'openai', vision: true },
  'gpt-4o-2024-08-06': { name: 'gpt-4o-2024-08-06', provider: 'openai', vision: true },
  'gpt-4o-2024-05-13': { name: 'gpt-4o-2024-05-13', provider: 'openai', vision: true },
  'gpt-4o-mini': { name: 'gpt-4o-mini', provider: 'openai', vision: true },
  'gpt-4o-mini-2024-07-18': { name: 'gpt-4o-mini-2024-07-18', provider: 'openai', vision: true },
  'gpt-4-turbo': { name: 'gpt-4-turbo', provider: 'openai', vision: true },
  'gpt-4-turbo-2024-04-09': { name: 'gpt-4-turbo-2024-04-09', provider: 'openai', vision: true },
  'gpt-4-turbo-preview': { name: 'gpt-4-turbo-preview', provider: 'openai', vision: true },
  'gpt-4-vision-preview': { name: 'gpt-4-vision-preview', provider: 'openai', vision: true },
  'gpt-4': { name: 'gpt-4', provider: 'openai' },
  'gpt-4-0613': { name: 'gpt-4-0613', provider: 'openai' },
  'gpt-4-0314': { name: 'gpt-4-0314', provider: 'openai' },
  'gpt-3.5-turbo': { name: 'gpt-3.5-turbo', provider: 'openai' },
  'gpt-3.5-turbo-0125': { name: 'gpt-3.5-turbo-0125', provider: 'openai' },
  'gpt-3.5-turbo-1106': { name: 'gpt-3.5-turbo-1106', provider: 'openai' },

  // Claude Models
  'claude-3-5-sonnet-20241022': { name: 'claude-3-5-sonnet-20241022', provider: 'anthropic', vision: true },
  'claude-3-5-sonnet-20240620': { name: 'claude-3-5-sonnet-20240620', provider: 'anthropic', vision: true },
  'claude-3-5-haiku-20241022': { name: 'claude-3-5-haiku-20241022', provider: 'anthropic', vision: true },
  'claude-3-opus-20240229': { name: 'claude-3-opus-20240229', provider: 'anthropic', vision: true },
  'claude-3-sonnet-20240229': { name: 'claude-3-sonnet-20240229', provider: 'anthropic', vision: true },
  'claude-3-haiku-20240307': { name: 'claude-3-haiku-20240307', provider: 'anthropic', vision: true },

  // Gemini Models
  'gemini-1.5-pro': { name: 'gemini-1.5-pro', provider: 'google', vision: true },
  'gemini-1.5-pro-002': { name: 'gemini-1.5-pro-002', provider: 'google', vision: true },
  'gemini-1.5-flash': { name: 'gemini-1.5-flash', provider: 'google', vision: true },
  'gemini-1.5-flash-002': { name: 'gemini-1.5-flash-002', provider: 'google', vision: true },
  'gemini-1.5-flash-8b': { name: 'gemini-1.5-flash-8b', provider: 'google', vision: true },

  // Meta Llama Models
  'llama-3.2-90b-vision-instruct': { name: 'llama-3.2-90b-vision-instruct', provider: 'meta', vision: true },
  'llama-3.2-11b-vision-instruct': { name: 'llama-3.2-11b-vision-instruct', provider: 'meta', vision: true },
  'llama-3.1-405b-instruct': { name: 'llama-3.1-405b-instruct', provider: 'meta' },
  'llama-3.1-70b-instruct': { name: 'llama-3.1-70b-instruct', provider: 'meta' },
  'llama-3.1-8b-instruct': { name: 'llama-3.1-8b-instruct', provider: 'meta' },

  // Mistral Models
  'mistral-large-2407': { name: 'mistral-large-2407', provider: 'mistral' },
  'mistral-large-2402': { name: 'mistral-large-2402', provider: 'mistral' },
  'mistral-small-2409': { name: 'mistral-small-2409', provider: 'mistral' },
  'mistral-nemo': { name: 'mistral-nemo', provider: 'mistral' },
  'codestral-2405': { name: 'codestral-2405', provider: 'mistral' },

  // Image Generation Models
  'dall-e-3': { name: 'dall-e-3', provider: 'openai', type: 'image_generation' },
  'dall-e-2': { name: 'dall-e-2', provider: 'openai', type: 'image_generation' },
  'stable-diffusion-3.5-large': { name: 'stable-diffusion-3.5-large', provider: 'stability', type: 'image_generation' },
  'stable-diffusion-3.5-large-turbo': { name: 'stable-diffusion-3.5-large-turbo', provider: 'stability', type: 'image_generation' },
  'flux-1.1-pro': { name: 'flux-1.1-pro', provider: 'black-forest-labs', type: 'image_generation' },
  'flux-pro': { name: 'flux-pro', provider: 'black-forest-labs', type: 'image_generation' },
  'flux-dev': { name: 'flux-dev', provider: 'black-forest-labs', type: 'image_generation' },
  'flux-schnell': { name: 'flux-schnell', provider: 'black-forest-labs', type: 'image_generation' }
};

// OpenAI-style model aliases for backwards compatibility
export const MODEL_ALIASES = {
  'gpt-4': 'gpt-4o',
  'gpt-3.5-turbo': 'gpt-3.5-turbo-0125',
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307'
};

export function getModelInfo(modelId) {
  // Check aliases first
  const resolvedModel = MODEL_ALIASES[modelId] || modelId;
  return MODELS_CONFIG[resolvedModel] || null;
}

export function isVisionModel(modelId) {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.vision === true;
}

export function isImageGenerationModel(modelId) {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.type === 'image_generation';
}

export function validateModel(modelId) {
  const modelInfo = getModelInfo(modelId);
  if (!modelInfo) {
    return { valid: false, error: `Model '${modelId}' is not supported` };
  }

  return { valid: true, model: modelInfo };
}

export function getAllModels() {
  return Object.keys(MODELS_CONFIG);
}

export function formatModelsForOpenAI() {
  const models = getAllModels();
  
  return models.map(modelId => {
    const modelInfo = getModelInfo(modelId);
    return {
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: modelInfo.provider,
      permission: [],
      root: modelId,
      parent: null
    };
  });
}