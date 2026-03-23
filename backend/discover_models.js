const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("Checking API Key:", apiKey ? "Present (Starts with " + apiKey.substring(0, 4) + "...)" : "MISSING");
    
    const versions = ['v1', 'v1beta'];
    
    for (const version of versions) {
        console.log(`\n--- Testing API Version: ${version} ---`);
        try {
            const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
            const response = await axios.get(url);
            console.log(`Success! Found ${response.data.models.length} models.`);
            
            response.data.models.forEach(m => {
                const supportsGenerate = m.supportedGenerationMethods.includes('generateContent');
                console.log(` - ${m.name} [${supportsGenerate ? 'Supports Content' : 'No Content'}]`);
            });
        } catch (error) {
            console.error(`Error with ${version}:`, error.response?.status, error.response?.data?.error?.message || error.message);
        }
    }
}

listModels();
