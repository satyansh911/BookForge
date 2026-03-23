const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    const modelNames = response.data.models.map(m => m.name);
    fs.writeFileSync('available-models.txt', modelNames.join('\n'));
    console.log('Saved model names to available-models.txt');
  } catch (error) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    fs.writeFileSync('available-models-error.txt', errorMsg);
    console.log('Error saved to available-models-error.txt');
  }
}

listModels();
