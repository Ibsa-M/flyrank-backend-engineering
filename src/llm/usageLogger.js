function logLlmUsage({
  promptVersion,
  model,
  usage,
  durationMs,
  repair
}) {
  const inputTokens =
    usage?.prompt_tokens ??
    usage?.input_tokens ??
    null;

  const outputTokens =
    usage?.completion_tokens ??
    usage?.output_tokens ??
    null;

  const totalTokens =
    usage?.total_tokens ??
    (
      inputTokens !== null && outputTokens !== null
        ? inputTokens + outputTokens
        : null
    );

  console.log(
    JSON.stringify({
      event: 'llm_usage',
      prompt_version: promptVersion,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      duration_ms: durationMs,
      repair
    })
  );
}

module.exports = {
  logLlmUsage
};