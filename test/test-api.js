// Test script for the 1min AI gateway
// Run with: node test/test-api.js

const API_KEY = process.env.API_KEY || 'your-api-key-here';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8787';

async function testModelsEndpoint() {
  console.log('Testing /v1/models endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    const data = await response.json();
    console.log('✓ Models response:', JSON.stringify(data, null, 2));
    return response.ok;
  } catch (error) {
    console.error('✗ Models test failed:', error);
    return false;
  }
}

async function testChatCompletion() {
  console.log('\nTesting /v1/chat/completions endpoint (non-streaming)...');
  try {
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'o3-mini',
        messages: [
          { role: 'user', content: 'Say "Hello, World!" and nothing else.' }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Chat completion failed:', response.status, error);
      return false;
    }
    
    const data = await response.json();
    console.log('✓ Chat response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('✗ Chat completion test failed:', error);
    return false;
  }
}

async function testStreamingChatCompletion() {
  console.log('\nTesting /v1/chat/completions endpoint (streaming)...');
  try {
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          { role: 'user', content: 'Count from 1 to 5.' }
        ],
        max_tokens: 50,
        temperature: 0.7,
        stream: true
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Streaming failed:', response.status, error);
      return false;
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('✓ Stream completed');
          } else {
            try {
              const parsed = JSON.parse(data);
              chunks.push(parsed);
              if (parsed.choices?.[0]?.delta?.content) {
                process.stdout.write(parsed.choices[0].delta.content);
              }
            } catch (e) {
              console.error('Failed to parse chunk:', data);
            }
          }
        }
      }
    }
    
    console.log('\n✓ Received', chunks.length, 'chunks');
    return true;
  } catch (error) {
    console.error('✗ Streaming test failed:', error);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\nTesting /health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const text = await response.text();
    console.log('✓ Health check:', text);
    return response.ok;
  } catch (error) {
    console.error('✗ Health check failed:', error);
    return false;
  }
}

async function testImageGeneration() {
  console.log('\nTesting /v1/images/generations endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: '6b645e3a-d64f-4341-a6d8-7a3690fbf042',
        prompt: 'A cute cat sitting on a rainbow',
        size: '1024x1024',
        quality: 'standard',
        n: 1
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Image generation failed:', response.status, error);
      return false;
    }
    
    const data = await response.json();
    console.log('✓ Image generation response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('✗ Image generation test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting comprehensive API tests...');
  console.log('Base URL:', BASE_URL);
  console.log('API Key:', API_KEY.substring(0, 10) + '...\n');
  
  const results = {
    health: await testHealthEndpoint(),
    models: await testModelsEndpoint(),
    chat: await testChatCompletion(),
    streaming: await testStreamingChatCompletion(),
    imageGeneration: await testImageGeneration()
  };
  
  console.log('\n--- Test Results ---');
  console.log('Health Check:', results.health ? '✓ PASS' : '✗ FAIL');
  console.log('Models Endpoint:', results.models ? '✓ PASS' : '✗ FAIL');
  console.log('Chat Completion:', results.chat ? '✓ PASS' : '✗ FAIL');
  console.log('Streaming:', results.streaming ? '✓ PASS' : '✗ FAIL');
  console.log('Image Generation:', results.imageGeneration ? '✓ PASS' : '✗ FAIL');
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\nOverall:', allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(console.error);