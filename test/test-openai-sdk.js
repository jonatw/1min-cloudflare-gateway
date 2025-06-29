// Test using OpenAI SDK with the gateway
// First install: npm install openai
// Run with: node test/test-openai-sdk.js

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.API_KEY || 'your-api-key-here',
  baseURL: process.env.BASE_URL || 'http://localhost:8787/v1',
});

async function testWithOpenAISDK() {
  try {
    // Test 1: List models
    console.log('Testing models list...');
    const models = await client.models.list();
    console.log('Available models:', models.data.map(m => m.id));
    
    // Test 2: Non-streaming chat
    console.log('\nTesting non-streaming chat...');
    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello!' }],
      model: 'gpt-3.5-turbo',
      max_tokens: 50
    });
    console.log('Response:', completion.choices[0].message.content);
    
    // Test 3: Streaming chat
    console.log('\nTesting streaming chat...');
    const stream = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Count from 1 to 5' }],
      model: 'gpt-3.5-turbo',
      stream: true,
      max_tokens: 50
    });
    
    process.stdout.write('Streaming response: ');
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
    console.log('\n\n✓ All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testWithOpenAISDK();