const OpenAI = require('openai');

/**
 * Initialize and return OpenAI client instance
 * Uses environment variable OPENAI_API_KEY
 */
function getOpenAIClient() {
  // Get API key from environment variable
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("API Key check:", {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      startsWith: apiKey?.substring(0, 5) || "none",
    });
  }
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error(
      "OPENAI_API_KEY_NOT_CONFIGURED"
    );
  }
  
  // Basic validation - OpenAI keys typically start with sk-
  if (!apiKey.startsWith("sk-")) {
    throw new Error(
      "OPENAI_API_KEY_INVALID_FORMAT"
    );
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

module.exports = { getOpenAIClient };
