// Mock 1min AI server for local testing
// Run with: node test/mock-server.js

const http = require('http');

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
      if (request.type === 'IMAGE_GENERATION') {
        // Handle image generation
        res.end(JSON.stringify({
          images: [{
            url: 'https://example.com/generated-image.png'
          }]
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
        // Non-streaming response (1min AI format)
        res.end(JSON.stringify({
          response: 'Hello from mock 1min AI server!',
          model: request.model,
          promptTokens: 10,
          completionTokens: 5
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
  console.log('  POST /api/features - Main 1min AI chat endpoint');
});