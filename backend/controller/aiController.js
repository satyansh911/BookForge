const { GoogleGenerativeAI } = require('@google/generative-ai');
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Startup Diagnostic: List available models immediately
(async () => {
    try {
        const axios = require('axios');
        console.log("--- STARTUP AI DIAGNOSTIC ---");
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        console.log("Models identified:", res.data.models?.map(m => m.name.split('/').pop()).join(', '));
        console.log("-----------------------------");
    } catch (e) {
        console.error("Startup AI Diagnostic Failed:", e.response?.data?.error?.message || e.message);
    }
})();

/**
 * Helper to get a working model with fallback
 */
async function getRobustModel(ai, prompt) {
    const attempts = [
        { model: 'gemini-2.0-flash', apiVersion: 'v1beta' },
        { model: 'gemini-2.5-flash', apiVersion: 'v1beta' },
        { model: 'gemini-1.5-flash', apiVersion: 'v1' },
        { model: 'gemini-1.5-flash', apiVersion: 'v1beta' },
        { model: 'gemini-pro', apiVersion: 'v1' },
        { model: 'gemini-flash-latest', apiVersion: 'v1beta' }
    ];

    let lastError = null;
    for (const attempt of attempts) {
        try {
            const model = ai.getGenerativeModel({ model: attempt.model }, { apiVersion: attempt.apiVersion });
            const result = await model.generateContent(prompt);
            return result; // Success!
        } catch (error) {
            console.error(`Attempt failed: ${attempt.model} on ${attempt.apiVersion} - Status: ${error.status || error.response?.status}`);
            lastError = error;
            
            // If we get a 404, let's try to list ANY available models to the console
            if (error.status === 404 || error.message.includes('404')) {
                const axios = require('axios');
                try {
                    const v = attempt.apiVersion || 'v1beta';
                    console.log(`Self-Diagnostic: Fetching available models for ${v}...`);
                    const res = await axios.get(`https://generativelanguage.googleapis.com/${v}/models?key=${process.env.GEMINI_API_KEY}`);
                    console.log(`Available Models for account [${v}]:`, res.data.models?.map(m => m.name).join(', ') || 'NONE');
                } catch (listErr) {
                    console.error("Self-Diagnostic Listing Failed:", listErr.message);
                }
            }
        }
    }
    throw lastError;
}

const generateOutline = async (req, res) => {
    try {
        const {topic, style,numChapters, description} = req.body;
        if(!topic){
            return res.status(400).json({ message: 'Please provide a topic for the outline' });
        }
        const prompt = `You are an expert book outline generator. Create a comprehensive book outline based on the following requirements:
        Topic: "${topic}"
        ${description ? `Description: ${description}` : ''}
        Writing Style: ${style}
        Number of Chapters: ${numChapters || 5}

        Requirements:
        1. Generate exactly ${numChapters || 5} chapters
        2. Each chapter title should be clear, engaging, and follow a logical progression
        3. Each chapter description should be 2-3 sentences explaining what the chapter covers
        4. Ensure chapters build upon each other coherently
        5. Match the "${style}" writing style in your titles and descriptions

        Output Format:
        Return ONLY a valid JSON array with no additional text, markdown, or formatting. Each object must have exactly two keys: "title" and "description".

        Example structure:
        [
            {
                "title": "Chapter 1: Introduction to the Topic",
                "description": "A comprehensive overview introducing the main concepts. Sets the foundation for understanding the subject matter."
            },
            {
                "title": "Chapter 2: Core Principles",
                "description": "Explores the fundamental principles and theories. Provides detailed examples and real-world applications."
            }
        ]
        
        Generate the outline now:
        `;
        const result = await getRobustModel(ai, prompt);
        const text = result.response.text();

        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');

        if(startIndex === -1 || endIndex === -1){
            console.error("Could not find outline in response:", text);
            return res.status(500).json({ message: 'Failed to generate outline' });
        }
        const jsonString = text.substring(startIndex, endIndex + 1);
        try{
            const outline = JSON.parse(jsonString);
            res.status(200).json({ outline });
        } catch (e){
            console.error("Error parsing outline JSON:", e, jsonString);
            res.status(500).json({ message: 'Failed to parse outline' });
        }
    } catch (error) {
        console.error("Error generating outline:", error);
        res.status(500).json({ message: 'Server error during AI outline generation' });
    }
};

const generateChapterContent = async (req, res) => {
    try {
        const {chapterTitle, chapterDescription, style} = req.body;
        if(!chapterTitle){
            return res.status(400).json({ message: 'Please provide a chapter title' });
        }
        const prompt=`You are an expert writer specializing in ${style} content. Write a complete chapter for a book with the following specifications:

        Chapter Title: "${chapterTitle}"
        ${chapterDescription ? `Chapter Description: ${chapterDescription}` : ''}
        Writing Style: ${style}
        Target Length: Comprehensive and detailed (aim for 1500–2500 words)

        Requirements:
        1. Write in a ${style.toLowerCase()} tone throughout the chapter
        2. Structure the content with clear sections and smooth transitions
        3. Include relevant examples, explanations, or anecdotes as appropriate for the style
        4. Ensure the content flows logically from introduction to conclusion
        5. Make the content engaging and valuable to readers
        ${chapterDescription ? '6. Cover all points mentioned in the chapter description' : ''}

        Format Guidelines:
        - Start with a compelling opening paragraph
        - Use clear paragraph breaks for readability
        - Include subheadings if appropriate for the content length
        - End with a strong conclusion or transition to the next chapter
        - Write in plain text without markdown formatting

        Begin writing the chapter content now:`;
        
        const result = await getRobustModel(ai, prompt);
        res.status(200).json({ content: result.response.text() });
    } catch (error) {
        console.error("Error generating chapter content:", error);
        res.status(500).json({ message: 'Server error during AI chapter content generation' });
    }
};

const getWordDefinition = async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Please provide text to define' });
        }

        const prompt = `You are a linguistic expert and dictionary. Provide a concise, clear definition for the following word or phrase. 
        If context is provided, ensure the definition matches the usage in that context.
        
        Word/Phrase: "${text}"
        ${context ? `Context from book: "...${context}..."` : ''}
        
        Requirements:
        1. Keep it brief (under 50 words).
        2. Provide the part of speech if applicable.
        3. Include one example sentence of correct usage.
        4. If it's a fictional term, infer meaning from context.

        Output: Just the definition, part of speech, and example. No extra conversational text.`;

        console.log("Lexicon Request:", { text, context });
        const result = await getRobustModel(ai, prompt);
        res.status(200).json({ definition: result.response.text() });
    } catch (error) {
        console.error("GENIMI ERROR IN getWordDefinition:", error.message);
        if (error.response) {
            console.error("Full Error Response:", error.response.data);
        }
        res.status(500).json({ 
            message: 'Failed to fetch definition.',
            error: error.message
        });
    }
};

const continueStory = async (req, res) => {
    try {
        const { title, summary, currentChapters } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Please provide a title to continue' });
        }

        const prompt = `You are a creative story architect. Based on the following monograph, synthesize a compelling "Next Volume" or "Saga Continuation" outline.
        
        Title: "${title}"
        Summary: ${summary || "An archived masterpiece."}
        Existing Segments: ${currentChapters?.map(c => c.title).join(', ')}

        Requirements:
        1. Propose a new Volume Title.
        2. Provide a 3-paragraph "Future Path" or premise for the continuation.
        3. Suggest 3 new chapter titles with brief hooks.
        4. Maintain the thematic integrity of the original work.

        Output: Format the response in a structured, readable way.`;

        const result = await getRobustModel(ai, prompt);
        res.status(200).json({ continuation: result.response.text() });
    } catch (error) {
        console.error("Error continuing story:", error);
        res.status(500).json({ message: 'Failed to synthesize continuation.' });
    }
};

const speakText = async (req, res) => {
    try {
        const { text, voiceId } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Please provide text to synthesize' });
        }

        const axios = require('axios');
        const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
        
        if (!ELEVEN_LABS_API_KEY || ELEVEN_LABS_API_KEY === 'YOUR_ELEVEN_LABS_API_KEY_HERE') {
            return res.status(400).json({ message: 'Eleven Labs API Key is missing. Please add it to your .env file.' });
        }

        const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - a versatile voice

        const response = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || DEFAULT_VOICE_ID}`,
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

        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);
    } catch (error) {
        console.error("Eleven Labs Error:", error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to synthesize speech.' });
    }
};

module.exports = {
    generateOutline,
    generateChapterContent,
    getWordDefinition,
    continueStory,
    speakText
};