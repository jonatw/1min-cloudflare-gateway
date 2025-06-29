// OpenAI-compatible error handling
export const ERROR_CODES = {
  INVALID_REQUEST_ERROR: 'invalid_request_error',
  AUTHENTICATION_ERROR: 'authentication_error',
  PERMISSION_ERROR: 'permission_error',
  NOT_FOUND_ERROR: 'not_found_error',
  REQUEST_TOO_LARGE: 'request_too_large',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  API_ERROR: 'api_error',
  OVERLOADED_ERROR: 'overloaded_error',
  INTERNAL_ERROR: 'internal_error'
};

export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid API key provided',
  MISSING_API_KEY: 'Missing API key in Authorization header',
  INVALID_MODEL: 'The model specified does not exist or is not available',
  MODEL_NOT_PERMITTED: 'The model specified is not permitted for your account',
  INVALID_REQUEST: 'Invalid request format or parameters',
  MISSING_MESSAGES: 'Missing required parameter: messages',
  INVALID_MESSAGE_FORMAT: 'Invalid message format in messages array',
  IMAGE_NOT_SUPPORTED: 'Image content is not supported by this model',
  REQUEST_TOO_LARGE: 'Request payload is too large',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  UPSTREAM_ERROR: 'Error from upstream AI service',
  INTERNAL_ERROR: 'Internal server error occurred'
};

export class APIError extends Error {
  constructor(message, type = ERROR_CODES.API_ERROR, param = null, code = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }

  toResponse(status = 400) {
    return new Response(JSON.stringify({
      error: {
        message: this.message,
        type: this.type,
        param: this.param,
        code: this.code
      }
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export function createErrorResponse(message, type = ERROR_CODES.API_ERROR, status = 400, param = null, code = null) {
  const error = new APIError(message, type, param, code);
  return error.toResponse(status);
}

export function handleAuthenticationError() {
  return createErrorResponse(
    ERROR_MESSAGES.INVALID_API_KEY,
    ERROR_CODES.AUTHENTICATION_ERROR,
    401
  );
}

export function handleMissingApiKey() {
  return createErrorResponse(
    ERROR_MESSAGES.MISSING_API_KEY,
    ERROR_CODES.AUTHENTICATION_ERROR,
    401
  );
}

export function handleInvalidModel(modelId) {
  return createErrorResponse(
    `${ERROR_MESSAGES.INVALID_MODEL}: ${modelId}`,
    ERROR_CODES.INVALID_REQUEST_ERROR,
    400,
    'model'
  );
}

// Removed handleModelNotPermitted - no longer needed since all models are available

export function handleInvalidRequest(message, param = null) {
  return createErrorResponse(
    message,
    ERROR_CODES.INVALID_REQUEST_ERROR,
    400,
    param
  );
}

export function handleRateLimitError() {
  return createErrorResponse(
    ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    ERROR_CODES.RATE_LIMIT_ERROR,
    429
  );
}

export function handleUpstreamError(originalError) {
  console.error('Upstream API error:', originalError);
  
  return createErrorResponse(
    ERROR_MESSAGES.UPSTREAM_ERROR,
    ERROR_CODES.API_ERROR,
    502
  );
}

export function handleInternalError(error) {
  console.error('Internal error:', error);
  
  return createErrorResponse(
    ERROR_MESSAGES.INTERNAL_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    500
  );
}