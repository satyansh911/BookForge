const axios = require('axios');
// const cheerio = require('cheerio'); // Temporarily disabled to fix backend crash
const Book = require('../models/Book');

const ingestFromUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'Please provide a URL to ingest' });
        }

        const response = await axios.get(url);
        
        // TEMPORARY FALLBACK: Simple regex for title and text since cheerio is installing
        const titleMatch = response.data.match(/<title>(.*?)<\/title>/i);
        const title = (titleMatch ? titleMatch[1] : 'Ingested Book').trim();
        
        // Extract paragraph text with a simple regex
        const content = [];
        const pMatches = response.data.match(/<p>(.*?)<\/p>/gi);
        if (pMatches) {
            pMatches.forEach(p => {
                const text = p.replace(/<[^>]*>?/gm, '').trim();
                if (text.length > 50) content.push(text);
            });
        }

        if (content.length === 0) {
            // If regex fails, just take a chunk of the body as a last resort
            const bodyMatch = response.data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
                const text = bodyMatch[1].replace(/<[^>]*>?/gm, '').trim();
                if (text.length > 100) content.push(text.substring(0, 10000));
            }
        }

        if (content.length === 0) {
            return res.status(400).json({ message: 'Could not extract significant content from this URL' });
        }

        // Split into rough chapters of ~2000 words
        const words = content.join('\n\n').split(/\s+/);
        const chapters = [];
        const wordsPerChapter = 2000;

        for (let i = 0; i < words.length; i += wordsPerChapter) {
            chapters.push({
                title: `Segment ${Math.floor(i / wordsPerChapter) + 1}`,
                content: words.slice(i, i + wordsPerChapter).join(' ')
            });
        }

        const newBook = new Book({
            title,
            author: 'Internet Resource',
            summary: `Content ingested from ${url}`,
            chapters,
            user: req.user._id,
            coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2735&auto=format&fit=crop',
            category: 'Archived'
        });

        await newBook.save();
        res.status(201).json({ message: 'Book ingested successfully (using lite-ingest)', bookId: newBook._id });
    } catch (error) {
        console.error("Ingestion error:", error);
        res.status(500).json({ message: 'Failed to ingest content from URL' });
    }
};

module.exports = { ingestFromUrl };
