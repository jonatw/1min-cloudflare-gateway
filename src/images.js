// Image handling and multi-modal support
import { handleInvalidRequest } from './errors.js';

export async function processImageContent(content, env) {
  if (typeof content === 'string') {
    return content; // Plain text content
  }

  if (Array.isArray(content)) {
    const processedContent = [];
    
    for (const item of content) {
      if (item.type === 'text') {
        processedContent.push(item.text);
      } else if (item.type === 'image_url') {
        const imageData = await processImageUrl(item.image_url, env);
        processedContent.push(imageData);
      }
    }
    
    return processedContent;
  }

  return content;
}

export async function processImageUrl(imageUrl, env) {
  const url = imageUrl.url;
  
  if (url.startsWith('data:image/')) {
    // Base64 encoded image
    return await uploadBase64Image(url, env);
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    // External image URL
    return await uploadExternalImage(url, env);
  } else {
    throw new Error('Invalid image URL format');
  }
}

export async function uploadBase64Image(dataUrl, env) {
  try {
    // Extract the base64 data and mime type
    const matches = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const [, mimeType, base64Data] = matches;
    
    // Upload to 1min AI assets endpoint
    const uploadResponse = await fetch(`${env.ONE_MIN_API_URL}/api/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': env.clientApiKey  // Use the client's API key passed from main handler
      },
      body: JSON.stringify({
        type: 'image',
        data: base64Data,
        mimeType: `image/${mimeType}`
      })
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to 1min AI');
    }

    const uploadResult = await uploadResponse.json();
    return {
      type: 'image',
      asset_id: uploadResult.id,
      url: uploadResult.url
    };
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw new Error('Failed to process image upload');
  }
}

export async function uploadExternalImage(imageUrl, env) {
  try {
    // Fetch the external image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch external image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Upload to 1min AI assets endpoint
    const uploadResponse = await fetch(`${env.ONE_MIN_API_URL}/api/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': env.clientApiKey  // Use the client's API key passed from main handler
      },
      body: JSON.stringify({
        type: 'image',
        data: base64Data,
        mimeType: contentType
      })
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to 1min AI');
    }

    const uploadResult = await uploadResponse.json();
    return {
      type: 'image',
      asset_id: uploadResult.id,
      url: uploadResult.url
    };
  } catch (error) {
    console.error('Error uploading external image:', error);
    throw new Error('Failed to process external image');
  }
}

export function hasImageContent(messages) {
  return messages.some(message => {
    if (Array.isArray(message.content)) {
      return message.content.some(item => item.type === 'image_url');
    }
    return false;
  });
}

export function validateImageSupport(modelId, messages, isVisionModelFn) {
  const hasImages = hasImageContent(messages);
  if (!hasImages) {
    return { valid: true };
  }

  if (!isVisionModelFn(modelId)) {
    return {
      valid: false,
      error: `Model '${modelId}' does not support image inputs`
    };
  }

  return { valid: true };
}