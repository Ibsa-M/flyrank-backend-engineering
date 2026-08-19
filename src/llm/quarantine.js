const fs = require('fs');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');
const quarantinePath = path.join(logDir, 'quarantine.jsonl');

function writeQuarantineRecord(record) {
  fs.mkdirSync(logDir, { recursive: true });

  fs.appendFileSync(
    quarantinePath,
    `${JSON.stringify(record)}\n`,
    'utf8'
  );
}

module.exports = {
  writeQuarantineRecord,
  quarantinePath
};