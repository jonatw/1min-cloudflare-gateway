// Token calculation utilities
export function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Rough estimation: ~4 characters per token for English text
  // This is a simplified version - a proper implementation would use tiktoken
  return Math.ceil(text.length / 4);
}

export function calculatePromptTokens(messages) {
  let totalTokens = 0;
  
  for (const message of messages) {
    // Add tokens for role
    totalTokens += estimateTokens(message.role);
    
    // Add tokens for content
    if (typeof message.content === 'string') {
      totalTokens += estimateTokens(message.content);
    } else if (Array.isArray(message.content)) {
      for (const item of message.content) {
        if (item.type === 'text') {
          totalTokens += estimateTokens(item.text);
        } else if (item.type === 'image_url') {
          // Images typically cost ~85 tokens for vision models
          totalTokens += 85;
        }
      }
    }
    
    // Add overhead tokens for message formatting
    totalTokens += 4;
  }
  
  // Add overhead for conversation formatting
  totalTokens += 2;
  
  return totalTokens;
}

export function calculateCompletionTokens(responseText) {
  return estimateTokens(responseText);
}

export function calculateTotalTokens(promptTokens, completionTokens) {
  return promptTokens + completionTokens;
}

export function createUsageObject(promptTokens, completionTokens) {
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: calculateTotalTokens(promptTokens, completionTokens)
  };
}