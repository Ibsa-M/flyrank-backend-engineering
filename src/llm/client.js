const OpenAI = require('openai');
const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '30000');

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: timeoutMs,
  maxRetries: 0,
});

module.exports = client;