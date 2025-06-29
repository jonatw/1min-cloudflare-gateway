# 1min AI Cloudflare Gateway

[![GitHub stars](https://img.shields.io/github/stars/jonatw/1min-cloudflare-gateway?style=social)](https://github.com/jonatw/1min-cloudflare-gateway/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jonatw/1min-cloudflare-gateway)

A high-performance Cloudflare Workers gateway providing complete OpenAI API compatibility for 1min AI, featuring 40+ models, multi-modal support, and image generation.

> **Based on the original [1min-relay](https://github.com/kokofixcomputers/1min-relay) project by kokodev, adapted for Cloudflare Workers.**

## 🚀 Features

- ✅ **Complete OpenAI compatibility** - Drop-in replacement for any OpenAI client
- ✅ **40+ AI models** - GPT, Claude, Gemini, Llama, Mistral, image generation
- ✅ **Multi-modal support** - Text + image conversations with vision models  
- ✅ **Streaming responses** - Real-time chat with token tracking
- ✅ **Pure proxy mode** - Users provide their own 1min AI API keys
- ✅ **Global edge deployment** - <50ms latency worldwide
- ✅ **Zero configuration** - Deploy and use immediately

## Quick Start

### 1. Deploy to Cloudflare Workers
```bash
git clone git@github.com:jonatw/1min-cloudflare-gateway.git
cd 1min-cloudflare-gateway
npm install
npm run deploy
```

### 2. Get Your 1min AI API Key
- Visit [1min.ai](https://1min.ai) and create an account
- Generate your API key from the dashboard

### 3. Use with Any OpenAI Client
```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_1MIN_AI_API_KEY" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## API Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/v1/chat/completions` | POST | Chat with 40+ models, supports vision & streaming |
| `/v1/images/generations` | POST | Generate images with DALL-E, Stable Diffusion, Flux |
| `/v1/models` | GET | List all available models |
| `/health` | GET | Health check |

## How It Works

The gateway operates as a **pure proxy**:

1. **Client** sends OpenAI-formatted request with their 1min AI API key
2. **Gateway** validates and transforms the request format  
3. **Gateway** forwards to 1min AI using the client's API key
4. **Gateway** transforms response back to OpenAI format
5. **Client** receives OpenAI-compatible response

**Benefits:**
- ✅ No shared API keys - each user pays 1min AI directly
- ✅ Transparent billing - direct user ↔ 1min AI relationship  
- ✅ Enhanced security - no centralized key management
- ✅ Zero configuration - deploy and use immediately

## Supported Models

| Provider | Models | Vision | Image Gen |
|----------|--------|--------|-----------|
| **OpenAI** | GPT-4o, GPT-4 Turbo, GPT-3.5 | ✅ | ✅ DALL-E |
| **Anthropic** | Claude 3.5 Sonnet/Haiku, Claude 3 Opus/Sonnet/Haiku | ✅ | ❌ |
| **Google** | Gemini 1.5 Pro/Flash (all variants) | ✅ | ❌ |
| **Meta** | Llama 3.2 Vision, Llama 3.1 (405B/70B/8B) | ✅ | ❌ |
| **Mistral** | Large, Small, Nemo, Codestral | ❌ | ❌ |
| **Others** | Stable Diffusion, Flux Pro/Dev/Schnell | ❌ | ✅ |

## SDK Examples

### Python
```python
import openai
client = openai.OpenAI(
    api_key="your-1min-ai-api-key",
    base_url="https://your-worker.workers.dev/v1"
)
response = client.chat.completions.create(
    model="claude-3-5-sonnet-20241022",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Node.js
```javascript
import OpenAI from 'openai';
const client = new OpenAI({
    apiKey: 'your-1min-ai-api-key',
    baseURL: 'https://your-worker.workers.dev/v1'
});
```

### LangChain
```python
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(
    openai_api_base="https://your-worker.workers.dev/v1",
    openai_api_key="your-1min-ai-api-key",
    model_name="gpt-4o"
)
```

## Development

### Local Testing
```bash
# Terminal 1: Start mock server
node test/mock-server.js

# Terminal 2: Start gateway
npm run dev

# Terminal 3: Run tests
npm run test:api
```

### Production Deployment
```bash
npm run deploy
```

## Contributing

```bash
git clone git@github.com:jonatw/1min-cloudflare-gateway.git
cd 1min-cloudflare-gateway
npm install
npm run test:all
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

**Original Source**: This project is based on [1min-relay](https://github.com/kokofixcomputers/1min-relay) by kokodev, adapted for Cloudflare Workers.

---

**Made with ❤️ for the AI community**