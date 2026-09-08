const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/leagues/1e91fbf0-3bf3-49a9-b14e-ae38bf921817',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
