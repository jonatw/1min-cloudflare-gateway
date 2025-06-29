import { formatModelsForOpenAI, validateModel, isVisionModel, isImageGenerationModel } from './models.js';
import { handleAuthenticationError, handleMissingApiKey, handleInvalidModel, handleInvalidRequest, handleUpstreamError, handleInternalError } from './errors.js';
import { processImageContent, validateImageSupport, hasImageContent } from './images.js';
import { calculatePromptTokens, calculateCompletionTokens, createUsageObject } from './tokens.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      switch (url.pathname) {
        case '/v1/chat/completions':
          return handleChatCompletions(request, env);
        case '/v1/models':
          return handleModels(env);
        case '/v1/images/generations':
          return handleImageGeneration(request, env);
        case '/health':
        case '/':
          return new Response('OK', { status: 200 });
        default:
          return new Response(JSON.stringify({ error: { message: 'Not Found', type: 'not_found_error' } }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      return handleInternalError(error);
    }
  }
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

async function handleChatCompletions(request, env) {
  // Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleMissingApiKey();
  }

  const apiKey = authHeader.substring(7);
  
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return handleInvalidRequest('Invalid JSON in request body');
  }

  // Validate required fields
  if (!body.messages || !Array.isArray(body.messages)) {
    return handleInvalidRequest('Missing required parameter: messages', 'messages');
  }

  if (body.messages.length === 0) {
    return handleInvalidRequest('Messages array cannot be empty', 'messages');
  }

  // Validate model
  const modelValidation = validateModel(body.model);
  if (!modelValidation.valid) {
    return handleInvalidModel(body.model);
  }

  // Validate image support
  const imageValidation = validateImageSupport(body.model, body.messages, isVisionModel);
  if (!imageValidation.valid) {
    return handleInvalidRequest(imageValidation.error, 'model');
  }
  
  // Process images if present
  try {
    for (const message of body.messages) {
      if (Array.isArray(message.content)) {
        // Pass both env and the client's API key for image processing
        const envWithClientKey = { ...env, clientApiKey: apiKey };
        message.content = await processImageContent(message.content, envWithClientKey);
      }
    }
  } catch (error) {
    return handleInvalidRequest(`Image processing failed: ${error.message}`);
  }

  // Calculate prompt tokens
  const promptTokens = calculatePromptTokens(body.messages);
  
  const transformedRequest = transformOpenAITo1Min(body);
  
  let oneMinResponse;
  try {
    oneMinResponse = await fetch(`${env.ONE_MIN_API_URL}/api/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey  // Always use the client's API key
      },
      body: JSON.stringify(transformedRequest)
    });
  } catch (error) {
    return handleUpstreamError(error);
  }

  if (!oneMinResponse.ok) {
    const errorText = await oneMinResponse.text();
    console.error('1min AI API error:', oneMinResponse.status, errorText);
    return handleUpstreamError(new Error(`API returned ${oneMinResponse.status}`));
  }

  if (body.stream) {
    return handleStreamingResponse(oneMinResponse, promptTokens);
  }

  const responseData = await oneMinResponse.json();
  const transformedResponse = transform1MinToOpenAI(responseData, promptTokens);
  
  return new Response(JSON.stringify(transformedResponse), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleModels(env) {
  try {
    const models = formatModelsForOpenAI();

    return new Response(JSON.stringify({
      object: 'list',
      data: models
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return handleInternalError(error);
  }
}

function transformOpenAITo1Min(openAIRequest) {
  // Convert OpenAI messages to 1min AI conversation format
  const conversation = openAIRequest.messages.map(msg => {
    if (msg.role === 'system') {
      return `System: ${msg.content}`;
    } else if (msg.role === 'user') {
      return `Human: ${msg.content}`;
    } else if (msg.role === 'assistant') {
      return `Assistant: ${msg.content}`;
    }
    return msg.content;
  }).join('\n\n');

  return {
    type: 'CHAT_WITH_AI',
    model: mapOpenAIModelTo1Min(openAIRequest.model),
    promptObject: {
      prompt: conversation,
      isMixed: false,
      webSearch: false
    },
    stream: openAIRequest.stream || false,
    temperature: openAIRequest.temperature,
    maxTokens: openAIRequest.max_tokens
  };
}

function mapOpenAIModelTo1Min(openAIModel) {
  const modelMap = {
    'gpt-4': 'gpt-4',
    'gpt-4-turbo': 'gpt-4-turbo',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307'
  };
  return modelMap[openAIModel] || openAIModel;
}

function transform1MinToOpenAI(oneMinResponse, promptTokens = 0) {
  // Extract the response text from 1min AI format
  const responseText = oneMinResponse.response || oneMinResponse.text || '';
  const completionTokens = calculateCompletionTokens(responseText);
  
  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: oneMinResponse.model || 'gpt-3.5-turbo',
    system_fingerprint: null,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: responseText
      },
      logprobs: null,
      finish_reason: 'stop'
    }],
    usage: createUsageObject(promptTokens, completionTokens)
  };
}

async function handleStreamingResponse(response, promptTokens = 0) {
  const reader = response.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let totalCompletionTokens = 0;
  let completeResponse = '';

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Send final chunk with usage statistics
            const finalChunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-3.5-turbo',
              choices: [{
                index: 0,
                delta: {},
                logprobs: null,
                finish_reason: 'stop'
              }],
              usage: createUsageObject(promptTokens, totalCompletionTokens)
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }

          const chunk = decoder.decode(value);
          buffer += chunk;
          
          // Process complete lines from the buffer
          const lines = buffer.split('\n');
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]' || data === '') {
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.response || parsed.text || '';
                if (content) {
                  completeResponse += content;
                  totalCompletionTokens = calculateCompletionTokens(completeResponse);
                }
                const transformed = transformStreamChunk(parsed);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(transformed)}\n\n`));
              } catch (e) {
                console.error('Failed to parse stream chunk:', e.message);
                console.error('Raw chunk data:', JSON.stringify(data));
                // Skip malformed chunks and continue
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleImageGeneration(request, env) {
  // Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleMissingApiKey();
  }

  const apiKey = authHeader.substring(7);
  
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return handleInvalidRequest('Invalid JSON in request body');
  }

  // Validate required fields
  if (!body.prompt) {
    return handleInvalidRequest('Missing required parameter: prompt', 'prompt');
  }

  // Validate model for image generation
  if (!isImageGenerationModel(body.model)) {
    return handleInvalidModel(body.model);
  }

  // Transform request for 1min AI
  const transformedRequest = {
    type: 'IMAGE_GENERATOR',
    model: body.model,
    promptObject: {
      prompt: body.prompt,
      n: body.n || 1,
      size: body.size || '1024x1024'
    }
  };

  try {
    const oneMinResponse = await fetch(`${env.ONE_MIN_API_URL}/api/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey  // Always use the client's API key
      },
      body: JSON.stringify(transformedRequest)
    });

    if (!oneMinResponse.ok) {
      return handleUpstreamError(new Error(`API returned ${oneMinResponse.status}`));
    }

    const responseData = await oneMinResponse.json();
    
    // Transform response to OpenAI format
    const transformedResponse = {
      created: Math.floor(Date.now() / 1000),
      data: [{
        url: responseData.temporaryUrl || responseData.aiRecord?.temporaryUrl,
        revised_prompt: body.prompt
      }]
    };

    return new Response(JSON.stringify(transformedResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return handleUpstreamError(error);
  }
}

function transformStreamChunk(chunk) {
  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: chunk.model || 'gpt-3.5-turbo',
    system_fingerprint: null,
    choices: [{
      index: 0,
      delta: { 
        content: chunk.response || chunk.text || ''
      },
      logprobs: null,
      finish_reason: null
    }]
  };
}