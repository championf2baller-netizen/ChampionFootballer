const { getPositionShortForm } = require('./src/lib/playerIdentity');

const testCases = [
  { input: 'Defensive Mid (CDM)', expected: 'CDM' },
  { input: 'Defensive Mid', expected: 'CDM' },
  { input: 'Defensive Midfielder', expected: 'CDM' },
  { input: 'Central Midfielder', expected: 'CM' },
  { input: 'Attacking Midfielder', expected: 'CAM' },
  { input: 'Center-Back', expected: 'CB' },
  { input: 'Right-Back', expected: 'RB' },
  { input: 'Striker', expected: 'ST' },
  { input: 'Goalkeeper', expected: 'GK' },
  { input: 'Midfielder', expected: 'MF' },
  { input: 'Defender', expected: 'DF' }
];

let allPassed = true;
testCases.forEach(({ input, expected }) => {
  const result = getPositionShortForm(input);
  if (result !== expected) {
    console.error(`❌ FAILED for "${input}": got "${result}", expected "${expected}"`);
    allPassed = false;
  } else {
    console.log(`✅ PASSED: "${input}" -> "${result}"`);
  }
});

if (allPassed) {
  console.log('\n✨ ALL POSITION TESTS PASSED SUCCESSFULLY!');
}
