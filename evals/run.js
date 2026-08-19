const fs = require('fs');
const path = require('path');

const casesPath = path.join(__dirname, 'cases.json');
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

const BASE_URL = process.env.EVAL_BASE_URL || 'http://localhost:3000';

async function runCase(testCase) {
  const response = await fetch(`${BASE_URL}/enrich`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testCase.input)
  });

  const body = await response.json();

  return {
    status: response.status,
    body
  };
}

function evaluateCase(testCase, result) {
  const expected = testCase.expected;

  if (result.status !== 200) {
    return {
      passed: false,
      reason: `Expected HTTP 200, received ${result.status}`
    };
  }

  const actualCategory = result.body.category;

  if (actualCategory !== expected.category) {
    return {
      passed: false,
      reason: `Category mismatch: expected "${expected.category}", received "${actualCategory}"`
    };
  }

  const actualFlags = result.body.quality_flags || [];

  const missingFlags = expected.required_quality_flags.filter(
    flag => !actualFlags.includes(flag)
  );

  if (missingFlags.length > 0) {
    return {
      passed: false,
      reason: `Missing required flags: ${missingFlags.join(', ')}`
    };
  }

  return {
    passed: true,
    reason: 'category and required quality flags matched'
  };
}

async function main() {
  let passed = 0;

  console.log(`Running ${cases.length} evaluation cases...\n`);

  for (const testCase of cases) {
    try {
      const result = await runCase(testCase);
      const evaluation = evaluateCase(testCase, result);

      if (evaluation.passed) {
        passed += 1;
        console.log(`PASS ${testCase.id} - ${evaluation.reason}`);
      } else {
        console.log(`FAIL ${testCase.id} - ${evaluation.reason}`);
        console.log('  Actual:', JSON.stringify(result.body));
      }
    } catch (error) {
      console.log(`FAIL ${testCase.id} - ${error.message}`);
    }
  }

  const accuracy = (passed / cases.length) * 100;

  console.log('\n--------------------------------');
  console.log(`Passed: ${passed}/${cases.length}`);
  console.log(`Category accuracy: ${accuracy.toFixed(1)}%`);
  console.log('--------------------------------');

  if (passed !== cases.length) {
    process.exitCode = 1;
  }
}

main();