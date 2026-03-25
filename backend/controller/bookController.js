const Book = require('../models/Book');

const createBook = async (req, res) => {
    try{
        const { title, author, subtitle, chapters, isSynthesized} = req.body;
        if(!title || !author){
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const book = new Book({
            userId: req.user._id,
            title,
            author,
            subtitle,
            chapters,
            isSynthesized: !!isSynthesized
        });
        
        const savedBook = await book.save();

        if (isSynthesized) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user._id, { $inc: { synthesizedBookCount: 1 } });
        }

        res.status(201).json(savedBook);
    } catch (error) {
        console.error("Create Book Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBooks = async (req, res) => {
    try{
        const books = await Book.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getBookById = async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }
        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: 'Not authorized to access this book' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBook = async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);

        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }
        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: 'Not authorized to update this book' });
        }
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteBook = async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }   
        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: 'Not authorized to delete this book' });
        }
        await book.deleteOne();
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBookCover = async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);

        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }
        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({ message: 'Not authorized to update this book cover' });
        }
        if(req.file){
            book.coverImage = `/${req.file.path}`.replace(/\\/g, '/');
        } else{
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }

        const fs = require('fs');
        const path = require('path');
        const pdf = require('pdf-parse');
        
        const filePath = path.resolve(req.file.path);
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        
        const text = data.text.trim();
        if (!text || text.length < 10) {
            console.warn("PDF Text Extraction yielded very little text:", text.length);
            throw new Error("No readable text found in PDF. It might be a scanned image or encrypted.");
        }

        // Extract title from filename
        const originalName = req.file.originalname.replace(/\.pdf$/i, '').split('-').slice(0, -1).join('-') || req.file.originalname;
        
        const chapters = [];
        const chunkSize = 5000;
        
        for (let i = 0; i < text.length; i += chunkSize) {
            chapters.push({
                title: `Section ${(chapters.length + 1).toString().padStart(2, '0')}`,
                content: text.substring(i, i + chunkSize),
                description: `Ingested Content: Part ${chapters.length + 1}`
            });
        }

        const book = new Book({
            userId: req.user._id,
            title: originalName.toUpperCase() || "IMPORTED MONOGRAPH",
            author: req.user.name || "Unknown Author",
            chapters: chapters.slice(0, 50), 
            status: 'draft'
        });

        const savedBook = await book.save();
        fs.unlinkSync(filePath);

        res.status(201).json(savedBook);
    } catch (error) {
        console.error("PDF Ingestion Error Details:", error);
        res.status(500).json({ 
            message: error.message || 'Failed to ingest PDF. Ensure it is text-readable and not secured.' 
        });
    }
};

const updateBookProgress = async (req, res) => {
    try {
        const { lastChapterIndex, lastPageIndex } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (book.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this book' });
        }

        book.lastChapterIndex = lastChapterIndex;
        book.lastPageIndex = lastPageIndex;
        
        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const addAnnotation = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Unauthorized' });

        book.annotations.push(req.body);
        await book.save();
        res.status(201).json(book.annotations[book.annotations.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAnnotation = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Unauthorized' });

        book.annotations = book.annotations.filter(ann => ann._id.toString() !== req.params.annotationId);
        await book.save();
        res.status(200).json({ message: 'Annotation deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRelatedBooks = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const axios = require('axios');
        // Search only by title to find the original work (even if reimagined)
        const query = encodeURIComponent(book.title);
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`);
        
        const related = response.data.items?.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail,
            description: item.volumeInfo.description,
            previewLink: item.volumeInfo.previewLink
        })) || [];

        res.status(200).json(related);
    } catch (error) {
        console.error("Related Books Error:", error);
        res.status(500).json({ message: 'Failed to fetch related books' });
    }
};

const getBookDeals = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const axios = require('axios');
        // Search only by book title to find original published works
        const query = encodeURIComponent(book.title);
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`);
        
        let deals = [];
        const seenTitles = new Set();
        const baseTitle = book.title.toLowerCase().trim();

        if (response.data.items) {
            deals = response.data.items.map(item => {
                const title = item.volumeInfo.title;
                const lowTitle = title.toLowerCase().trim();
                const author = item.volumeInfo.authors?.[0] || "";
                const hasBuyLink = !!item.saleInfo?.buyLink;
                
                // For regular books, we want a strict match. 
                // For synthesized books, we allow broader "Related Market" discovery.
                const isMatch = !book.isSynthesized ? 
                    (lowTitle.includes(baseTitle) || baseTitle.includes(lowTitle)) : 
                    true; // Allow all related for synthesized

                if (!isMatch) return null;
                if (seenTitles.has(lowTitle)) return null;
                seenTitles.add(lowTitle);

                const searchQuery = encodeURIComponent(`${title} ${author}`);

                return {
                    id: item.id,
                    title: title,
                    buyLink: item.saleInfo?.buyLink || `https://www.google.com/search?tbm=bks&q=${searchQuery}`,
                    price: item.saleInfo?.listPrice ? 
                        `${item.saleInfo.listPrice.amount} ${item.saleInfo.listPrice.currencyCode}` : 
                        (hasBuyLink ? "Check Price" : "Search Market"),
                    isEbook: item.saleInfo?.isEbook || false,
                    publisher: item.volumeInfo.publisher || (hasBuyLink ? "Direct Acquisition" : "Market Discovery"),
                    isExternalSearch: !hasBuyLink
                };
            }).filter(d => d !== null).slice(0, 3); // Limit to top 3 accurate results
        }

        // Final fallback if absolutely nothing found or no matches
        if (deals.length === 0) {
            const currentQuery = encodeURIComponent(`${book.title} ${book.author}`);
            deals.push({
                id: 'fallback-amazon',
                title: book.title,
                buyLink: `https://www.amazon.com/s?k=${currentQuery}`,
                price: "Market Price",
                isEbook: false,
                publisher: "Amazon Global Search",
                isExternalSearch: true
            });
            deals.push({
                id: 'fallback-google',
                title: book.title,
                buyLink: `https://www.google.com/search?tbm=bks&q=${currentQuery}`,
                price: "Explorer Search",
                isEbook: false,
                publisher: "Google Books Explorer",
                isExternalSearch: true
            });
        }

        res.status(200).json(deals);
    } catch (error) {
        console.error("Book Deals Error:", error);
        res.status(500).json({ message: 'Failed to fetch deals' });
    }
};

const addBookmark = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Unauthorized' });

        book.bookmarks.push(req.body);
        await book.save();
        res.status(201).json(book.bookmarks[book.bookmarks.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteBookmark = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Unauthorized' });

        book.bookmarks = book.bookmarks.filter(bm => bm._id.toString() !== req.params.bookmarkId);
        await book.save();
        res.status(200).json({ message: 'Bookmark deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
    updateBookCover,
    uploadPdf,
    updateBookProgress,
    addAnnotation,
    deleteAnnotation,
    addBookmark,
    deleteBookmark,
    getRelatedBooks,
    getBookDeals
};