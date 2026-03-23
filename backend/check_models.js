const https = require('https');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'diagnostic.log');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log("Starting diagnostic...");

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  log(".env file not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  log("API Key not found in .env");
  process.exit(1);
}

function check(version) {
  return new Promise((resolve) => {
    log(`--- Checking ${version} ---`);
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.models) {
            log(`Available models in ${version}:`);
            json.models.forEach(m => log(` - ${m.name}`));
          } else {
            log(`Error/No models in ${version}: ${JSON.stringify(json, null, 2)}`);
          }
        } catch (e) {
          log(`Parse error for ${version}: ${e.message}`);
          log("Raw output: " + data);
        }
        resolve();
      });
    }).on('error', (err) => {
      log(`Request error for ${version}: ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  await check('v1');
  await check('v1beta');
  log("Diagnostic complete.");
}

run();
