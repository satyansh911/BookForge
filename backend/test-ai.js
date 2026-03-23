require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
    console.log("Starting Gemini test...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);
    
    try {
        const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("Sending request to Gemini...");
        const result = await model.generateContent("Hello! This is a test. Respond with binary 1 if you can hear me.");
        console.log("RESULT RECEIVED!");
        console.log("Content:", result.response.text());
        process.exit(0);
    } catch (error) {
        console.error("DETAILED Gemini Error:", error);
        process.exit(1);
    }
}

testGemini();
