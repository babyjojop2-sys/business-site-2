const axios = require('axios');
const sodium = require('libsodium-wrappers-sumo');
require('dotenv').config();

const repo = process.argv[2];
const token = process.env.GITHUB_TOKEN;

if (!repo) {
  console.error('Usage: node set-github-secrets.js owner/repo');
  process.exit(1);
}

if (!token) {
  console.error('GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

async function run() {
  await sodium.ready;
  const api = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  const pkRes = await api.get(`/repos/${repo}/actions/secrets/public-key`);
  const publicKey = pkRes.data.key;
  const keyId = pkRes.data.key_id;

  const secrets = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET
  };

  for (const [name, value] of Object.entries(secrets)) {
    if (!value) {
      console.warn(`Skipping ${name}: no value provided`);
      continue;
    }
    const pubKeyUint8 = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
    const encryptedBytes = sodium.crypto_box_seal(value, pubKeyUint8);
    const encryptedValue = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

    await api.put(`/repos/${repo}/actions/secrets/${name}`, {
      encrypted_value: encryptedValue,
      key_id: keyId
    });
    console.log(`Set secret ${name}`);
  }
}

run().catch(err => {
  console.error('Error setting secrets:', err.response ? err.response.data : err.message);
  process.exit(1);
});
