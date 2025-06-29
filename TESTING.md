# Testing Guide

## Quick Start Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Test with Mock Server (No API Key Required)

In terminal 1, start the mock 1min AI server:
```bash
node test/mock-server.js
```

In terminal 2, start the Cloudflare Worker in development mode:
```bash
npm run dev
```

In terminal 3, run the tests:
```bash
# Test basic API endpoints
API_KEY=test-key npm run test:api

# Test with OpenAI SDK (optional)
npm install openai  # if not already installed
API_KEY=test-key npm run test:sdk
```

### 3. Test with Real 1min AI API

1. Get your 1min AI API key from [1min.ai](https://1min.ai)

2. Set up your environment:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your 1min AI API key
```

3. Update wrangler.toml to use the real API:
```bash
# Set your API key as a secret
wrangler secret put ONE_MIN_API_KEY
# Enter your real 1min AI API key when prompted
```

4. Run the worker:
```bash
npm run dev
```

5. Test with your API key:
```bash
API_KEY=your-api-key npm run test:api
```

## Manual Testing with cURL

### Test Health Check
```bash
curl http://localhost:8787/health
```

### Test Models Endpoint
```bash
curl http://localhost:8787/v1/models \
  -H "Authorization: Bearer your-api-key"
```

### Test Chat Completion (Non-Streaming)
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }'
```

### Test Chat Completion (Streaming)
```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Count to 5"}],
    "max_tokens": 50,
    "stream": true
  }'
```

## Testing with Different Clients

### Python OpenAI SDK
```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="http://localhost:8787/v1"
)

completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(completion.choices[0].message.content)
```

### LangChain
```python
from langchain.chat_models import ChatOpenAI

chat = ChatOpenAI(
    openai_api_base="http://localhost:8787/v1",
    openai_api_key="your-api-key",
    model_name="gpt-3.5-turbo"
)
```

## Production Testing

After deploying to Cloudflare Workers:
```bash
npm run deploy
```

Update your test scripts to use the production URL:
```bash
BASE_URL=https://your-worker.workers.dev API_KEY=your-key npm run test:api
```

## Troubleshooting

### Common Issues

1. **Connection refused on port 8787**
   - Make sure `npm run dev` is running
   - Check that wrangler is installed: `npm install`

2. **401 Unauthorized**
   - Verify your API key is correct
   - Check that the Authorization header format is: `Bearer YOUR_KEY`

3. **Mock server not working**
   - Ensure port 8788 is free
   - Check that the mock server is running in a separate terminal

4. **Streaming not working**
   - Verify your client supports SSE (Server-Sent Events)
   - Check that the stream parameter is set to `true`

### Debug Mode

Enable verbose logging by modifying src/index.js:
```javascript
console.log('Request:', request.method, request.url);
console.log('Headers:', Object.fromEntries(request.headers));
```