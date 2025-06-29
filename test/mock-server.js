// Mock 1min AI server for local testing
// Run with: node test/mock-server.js
// Supports all new models and proper 1min AI response format

const http = require('http');
const crypto = require('crypto');

// Mock models that should work
const SUPPORTED_MODELS = {
  // Text models
  'o3-mini': true,
  'o1-preview': true, 
  'o1-mini': true,
  'gpt-4o': true,
  'gpt-4o-mini': true,
  'gpt-4-turbo': true,
  'gpt-4': true,
  'gpt-3.5-turbo': true,
  'claude-3-5-sonnet-20241022': true,
  'claude-3-opus-20240229': true,
  'claude-instant-1.2': true,
  'claude-2.1': true,
  'gemini-1.5-pro': true,
  'gemini-1.0-pro': true,
  'llama-3.1-405b-instruct': true,
  'mistral-large-latest': true,
  'pixtral-12b': true,
  'command': true,
  'deepseek-chat': true,
  'grok-2': true,
  // Image models
  'dall-e-3': true,
  'dall-e-2': true,
  'stable-diffusion-xl-1024-v1-0': true,
  'stable-image': true,
  'midjourney': true,
  '6b645e3a-d64f-4341-a6d8-7a3690fbf042': true, // Leonardo Phoenix
  '5c232a9e-9061-4777-980a-ddc8e65647c6': true, // Leonardo Vision
  'flux-schnell': true,
  'clipdrop': true
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  res.setHeader('Content-Type', 'application/json');
  
  // The /v1/models endpoint is handled by the gateway itself, not forwarded to 1min AI
  
  if (req.url === '/api/features' && req.method === 'POST') {
    // Check for API key
    const apiKey = req.headers['api-key'];
    console.log('Received API-KEY header:', apiKey);
    if (!apiKey) {
      console.log('No API-KEY header found!');
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Invalid API Key' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const request = JSON.parse(body);
      console.log('Request body:', JSON.stringify(request, null, 2));
      
      // Handle different request types
      if (request.type === 'IMAGE_GENERATOR') {
        // Validate model
        if (!SUPPORTED_MODELS[request.model]) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            message: `Invalid model ${request.model} for AI feature IMAGE_GENERATOR!`
          }));
          return;
        }
        
        // Generate mock image URL
        const timestamp = new Date().toISOString().replace(/[:.]/g, '_').slice(0, -1);
        const randomId = Math.floor(Math.random() * 1000000);
        const mockImageUrl = `https://s3.us-east-1.amazonaws.com/asset.1min.ai/images/${timestamp}_${randomId}.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=MOCK%2F20250629%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250629T145659Z&X-Amz-Expires=604800&X-Amz-Signature=mocksignature&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject`;
        
        // Handle image generation with 1min AI format
        res.end(JSON.stringify({
          aiRecord: {
            uuid: crypto.randomUUID(),
            userId: 'mock-user-id',
            teamId: 'mock-team-id',
            model: request.model,
            type: 'IMAGE_GENERATOR',
            status: 'SUCCESS',
            createdAt: new Date().toISOString(),
            aiRecordDetail: {
              promptObject: request.promptObject,
              resultObject: [`images/${timestamp}_${randomId}.png`],
              responseObject: {}
            }
          },
          temporaryUrl: mockImageUrl
        }));
        return;
      }
      
      if (request.stream) {
        // Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        
        const words = ['Hello', 'from', 'mock', 'server!'];
        let index = 0;
        
        const interval = setInterval(() => {
          if (index < words.length) {
            const chunk = {
              response: words[index] + ' ',
              model: request.model
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            index++;
          } else {
            res.write('data: [DONE]\n\n');
            res.end();
            clearInterval(interval);
          }
        }, 100);
      } else {
        // Validate model for chat
        if (!SUPPORTED_MODELS[request.model]) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            message: `Invalid model ${request.model} for AI feature CHAT_WITH_AI!`
          }));
          return;
        }
        
        // Non-streaming response (1min AI format)
        res.end(JSON.stringify({
          response: `Hello from mock ${request.model}! Your message: ${request.promptObject?.prompt?.slice(0, 50) || 'No message'}`,
          model: request.model,
          promptTokens: 10,
          completionTokens: 8
        }));
      }
    });
    return;
  }
  
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 8788;
server.listen(PORT, () => {
  console.log(`Mock 1min AI server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/features - Main 1min AI endpoint');
  console.log('  - Handles CHAT_WITH_AI for text generation');
  console.log('  - Handles IMAGE_GENERATOR for image generation');
  console.log(`\nSupported models: ${Object.keys(SUPPORTED_MODELS).length}`);
  console.log('  - Text: GPT, Claude, Gemini, Llama, Mistral, Cohere, DeepSeek, Grok');
  console.log('  - Image: DALL-E, Stable Diffusion, Leonardo, Midjourney, Flux, Clipdrop');
});