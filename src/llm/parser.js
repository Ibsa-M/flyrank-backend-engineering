function extractJson(content) {
  const trimmed = content.trim();

  // Handle Markdown JSON fences.
  if (trimmed.startsWith('```json') && trimmed.endsWith('```')) {
    return trimmed
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '');
  }

  if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
    return trimmed
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
  }

  // Handle explanatory text surrounding a JSON object.
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function parseJsonOutput(content) {
  const jsonText = extractJson(content);

  return JSON.parse(jsonText);
}

module.exports = {
  extractJson,
  parseJsonOutput
};