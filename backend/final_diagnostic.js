const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
    let output = "DIAGNOSTIC START\n";
    output += `API Key provided: ${apiKey ? "YES (" + apiKey.substring(0, 5) + "...)" : "NO"}\n`;

    const versions = ['v1', 'v1beta'];
    for (const v of versions) {
        output += `\n--- VERSION ${v} ---\n`;
        try {
            const res = await axios.get(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
            output += `Total models: ${res.data.models.length}\n`;
            res.data.models.forEach(m => {
                output += ` - ${m.name}\n`;
            });
        } catch (e) {
            output += `Error: ${e.response?.status} - ${e.response?.data?.error?.message || e.message}\n`;
        }
    }
    
    fs.writeFileSync('final_results.txt', output);
    console.log("Diagnostic complete. Results written to final_results.txt");
}

run();
