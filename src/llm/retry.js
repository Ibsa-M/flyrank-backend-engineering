function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status = error?.status;

  // Explicitly retry request timeouts.
  if (error?.name === 'APITimeoutError') {
    return true;
  }

  // Retry rate limits.
  if (status === 429) {
    return true;
  }

  // Retry server-side failures.
  if (status >= 500 && status <= 599) {
    return true;
  }

  // Do not retry client/authentication errors.
  return false;
}

function getRetryAfterMs(error) {
  const retryAfter =
    error?.headers?.['retry-after'] ??
    error?.headers?.get?.('retry-after');

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  return null;
}

function getBackoffMs(attempt) {
  const baseDelay = 1000;
  const exponentialDelay = baseDelay * (2 ** (attempt - 1));

  const jitter = Math.floor(Math.random() * 250);

  return exponentialDelay + jitter;
}

async function withRetry(operation, options = {}) {
  const maxRetries = Number(
    options.maxRetries ??
    process.env.LLM_MAX_RETRIES ??
    2
  );

  const maxAttempts = maxRetries + 1;

  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const result = await operation(attempt);

      return {
        result,
        attempts: attempt
      };

    } catch (error) {

      const retryable = isRetryableError(error);

      if (!retryable || attempt >= maxAttempts) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error);

      const delayMs =
        retryAfterMs !== null
          ? retryAfterMs
          : getBackoffMs(attempt);

      console.log(
        JSON.stringify({
          event: 'llm_retry',
          attempt,
          next_attempt: attempt + 1,
          delay_ms: delayMs,
          status: error?.status ?? null,
          error_type: error?.name ?? 'UnknownError'
        })
      );

      await sleep(delayMs);
    }
  }

  throw new Error('LLM retry loop exited unexpectedly');
}

module.exports = {
  withRetry,
  isRetryableError,
  getRetryAfterMs,
  getBackoffMs
};