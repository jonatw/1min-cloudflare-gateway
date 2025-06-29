# 1min AI Cloudflare Gateway - Technical Documentation

## Project Overview
A high-performance Cloudflare Workers gateway providing complete OpenAI API compatibility for the 1min AI platform. Features advanced multi-modal support, 40+ AI models, and enterprise-grade error handling.

**Based on**: [1min-relay](https://github.com/kokofixcomputers/1min-relay) by kokodev, adapted for Cloudflare Workers edge computing.

## Architecture
- **Runtime**: Cloudflare Workers (V8 isolate environment)
- **Language**: JavaScript ES6+ modules
- **API Compatibility**: Complete OpenAI API v1 format
- **Target API**: 1min.ai unified platform
- **Performance**: Global edge deployment with <50ms latency

## Key Components

### 1. Request Router (`src/index.js`)
- Handles all incoming requests with comprehensive routing
- Implements CORS for browser compatibility
- Advanced authentication and authorization
- Error boundary handling with OpenAI-compatible responses

### 2. Model Management (`src/models.js`)
- **40+ AI Models**: OpenAI GPT, Claude, Gemini, Llama, Mistral
- **Model Validation**: Capability verification
- **Vision Models**: Automatic detection for image-capable models
- **Image Generation**: Support for DALL-E, Stable Diffusion, Flux
- **Aliases**: Backwards compatibility with legacy model names

### 3. Multi-Modal Support (`src/images.js`)
- **Image Upload**: Base64 and external URL processing
- **Asset Management**: Automatic upload to 1min AI asset system
- **Format Support**: JPEG, PNG, WebP, GIF
- **Vision Integration**: Seamless image + text conversations

### 4. Error Handling (`src/errors.js`)
- **OpenAI Compatibility**: Exact error format matching
- **Comprehensive Codes**: Authentication, validation, upstream
- **Detailed Logging**: Full error context for debugging
- **Graceful Degradation**: Fallback responses for edge cases

### 5. Token Management (`src/tokens.js`)
- **Accurate Estimation**: Text and image token calculation
- **Usage Tracking**: Real-time prompt/completion token counts
- **Streaming Support**: Token accumulation during streaming
- **Cost Optimization**: Efficient token usage patterns

## API Endpoints

### `/v1/chat/completions`
- **Method**: POST
- **Purpose**: Main chat completion endpoint with vision support
- **Features**: 
  - Text and image inputs (multi-modal)
  - Streaming and non-streaming responses
  - Real-time token usage statistics
  - 40+ model support with automatic validation
  - Conversation history formatting
  - Advanced error handling

### `/v1/models`
- **Method**: GET
- **Purpose**: List available AI models
- **Response**: OpenAI-compatible models list with provider info
- **Features**:
  - Model capability metadata
  - Provider attribution

### `/v1/images/generations`
- **Method**: POST
- **Purpose**: Generate images using AI models
- **Features**:
  - Multiple image generation models
  - Size and quality parameters
  - Batch generation support
  - OpenAI-compatible response format

### `/health` and `/`
- **Method**: GET
- **Purpose**: Health check and service status
- **Response**: Simple OK status

## Configuration

### Environment Variables
- `ONE_MIN_API_URL`: Base URL for 1min AI API (default: https://api.1min.ai)

**Note: No API key storage needed!** The gateway operates as a pure proxy, using the client's API key from the Authorization header. All 40+ models from `src/models.js` are available by default.

### Wrangler Configuration
- **Development Environment**: Mock server integration for local testing
- **Production Environment**: Live 1min AI API integration
- **KV Namespace**: Caching support (setup required)
- **Compatibility**: Modern Workers runtime (no flags needed)

### Supported Models
**Text Models:**
- OpenAI: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo (all variants)
- Anthropic: Claude 3.5 Sonnet/Haiku, Claude 3 Opus/Sonnet/Haiku
- Google: Gemini 1.5 Pro/Flash (all variants)
- Meta: Llama 3.1/3.2 (all sizes, including vision)
- Mistral: Large, Small, Nemo, Codestral

**Image Generation Models:**
- DALL-E 3/2
- Stable Diffusion 3.5 Large/Turbo
- Flux 1.1 Pro, Pro, Dev, Schnell

## Development Commands
```bash
# Install dependencies
npm install

# Run local development with mock server
npm run dev

# Deploy to Cloudflare Workers
npm run deploy

# Run comprehensive API tests
npm run test:api

# Test with OpenAI SDK compatibility
npm run test:sdk

# Run all tests
npm run test:all
```

## Testing
- **Mock Server**: Full 1min AI API simulation for local development
- **Integration Tests**: All endpoints with real request/response flows
- **OpenAI SDK Tests**: Compatibility verification with official SDK
- **Multi-modal Tests**: Image upload and vision model testing
- **Error Handling Tests**: All error scenarios and edge cases

## Security Features
- **Authentication**: Bearer token validation with detailed error responses
- **Request Validation**: Comprehensive input sanitization and validation
- **CORS Support**: Configurable cross-origin resource sharing
- **Error Sanitization**: No sensitive data exposure in error responses

## Performance Optimizations
- **Edge Computing**: Global deployment across 300+ Cloudflare locations
- **Cold Start**: <5ms initialization time
- **Streaming**: Optimized server-sent events for real-time responses
- **Token Efficiency**: Smart token calculation and usage tracking
- **Caching Ready**: KV namespace integration for model metadata
- **Minimal Overhead**: Efficient request/response transformation

## Advanced Features
- **Multi-Modal AI**: Seamless text + image conversations
- **Vision Models**: Automatic capability detection and validation
- **Image Generation**: Full DALL-E and Stable Diffusion support
- **Token Tracking**: Real-time usage statistics and cost optimization
- **Error Recovery**: Graceful degradation and retry logic
- **Provider Abstraction**: Unified interface across multiple AI providers
- **Format Conversion**: Automatic OpenAI ↔ 1min AI format translation

## Monitoring & Debugging
- **Comprehensive Logging**: Detailed request/response logging
- **Error Tracking**: Structured error reporting with context
- **Performance Metrics**: Response time and token usage tracking
- **Health Checks**: Built-in service status monitoring
- **Debug Mode**: Enhanced logging for development environments