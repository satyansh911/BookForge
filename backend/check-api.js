const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const check = async () => {
    const results = {
        timestamp: new Date().toISOString(),
        apiKey: process.env.ELEVEN_LABS_API_KEY ? "FOUND" : "MISSING",
        error: null,
        data: null
    };

    try {
        const response = await axios.get('https://api.elevenlabs.io/v1/user', {
            headers: { 'xi-api-key': process.env.ELEVEN_LABS_API_KEY }
        });
        results.data = response.data;
    } catch (e) {
        results.error = {
            message: e.message,
            status: e.response?.status,
            data: e.response?.data
        };
    }

    fs.writeFileSync('api_result.json', JSON.stringify(results, null, 2));
    console.log("Done checking API.");
};

check();
