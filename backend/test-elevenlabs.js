const axios = require('axios');
require('dotenv').config();

const testSpeak = async () => {
    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
    const voiceId = "21m00Tcm4TlvDq8ikWAM";
    const text = "Hello, this is a test of the vocal cords.";

    console.log("Using Key:", ELEVEN_LABS_API_KEY);

    try {
        const response = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            data: {
                text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            },
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVEN_LABS_API_KEY,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });
        console.log("Success! Received audio data of length:", response.data.byteLength);
    } catch (error) {
        if (error.response) {
            console.error("Error Status:", error.response.status);
            console.error("Error Data:", Buffer.from(error.response.data).toString());
        } else {
            console.error("Error Message:", error.message);
        }
    }
};

testSpeak();
