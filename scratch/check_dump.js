const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

async function testDump() {
  const dumpPath = path.join(process.env.USERPROFILE || '', 'Documents', 'cfmono repo.txt');
  console.log('Testing dump at:', dumpPath);

  const extractor = path.join(__dirname, '..', 'championfootballerserver', 'extract-pgdump.py');
  const result = spawnSync('python', [extractor, '--file', dumpPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256
  });

  if (result.status !== 0) {
    console.error('Extractor failed:', result.stderr || result.stdout);
    return;
  }

  const payload = JSON.parse(result.stdout);
  console.log('Tables found in dump:', Object.keys(payload.tables || {}));
  console.log('User count in dump:', (payload.tables.User || []).length);
  console.log('Match count in dump:', (payload.tables.Match || []).length);
  console.log('MatchStatistic count in dump:', (payload.tables.MatchStatistic || []).length);
  console.log('Sample User in dump:', payload.tables.User[0]);
}

testDump().catch(console.error);
