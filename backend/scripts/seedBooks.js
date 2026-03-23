const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
require('dotenv').config();

const featuredBooks = [
    {
        title: "Typography: A Manual of Design",
        author: "Emil Ruder",
        subtitle: "A classic text on typographic design principles.",
        coverImage: "/src/assets/covers/typography_cover.png",
        category: "PRACTICE",
        year: "1967",
        chapters: [
            {
                title: "Chapter 1: The Nature of Typography",
                content: "Typography has one plain duty before it and that is to convey information in writing. No argument or consideration can absolve typography from this duty. A printed work which cannot be read becomes a product without purpose. The designer must follow the laws of optics and the logic of language. Typography is a functional art, where form follows function. The spacing, the weight, and the arrangement of type all contribute to the clarity of the message. Typography is not a decoration, it is a tool for communication.",
                description: "Introduction to the functional aspects of typography."
            },
            {
                title: "Chapter 2: Form and Function",
                content: "The form of a letter must be clear and distinct. Every element of the type should serve a purpose. In this chapter, we explore how different typefaces communicate different moods. A serif font may convey tradition and reliability, while a sans-serif font suggests modernization and efficiency. The relationship between the white space and the black characters is just as important as the characters themselves. Balance is key to a successful typographic layout.",
                description: "Exploration of how type form relates to its communicative function."
            }
        ]
    },
    {
        title: "Grid Systems",
        author: "Josef Müller-Brockmann",
        subtitle: "A visual communication manual for graphic designers.",
        coverImage: "/src/assets/covers/grid_systems_cover.png",
        category: "DESIGN",
        year: "1981",
        chapters: [
            {
                title: "The Grid System",
                content: "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice. The grid provides a structure that allows for consistency and clarity across multiple pages. It is the foundation of modern graphic design, enabling the designer to organize complex information into a readable and aesthetically pleasing format.",
                description: "Fundamental concepts of grid-based design."
            }
        ]
    },
    {
        title: "The Art of Color",
        author: "Johannes Itten",
        subtitle: "The subjective experience and objective rationale of color.",
        coverImage: "/src/assets/covers/art_of_color_cover.png",
        category: "INSPIRE",
        year: "1961",
        chapters: [
            {
                title: "Color Theory",
                content: "He who wishes to become a master of color must see, feel, and experience each individual color in its many endless combinations with all other colors. Colors have a physical existence, but they also have a psychological impact. The contrast of hue, light-dark contrast, and cold-warm contrast are essential tools for the artist and designer. Understanding the color wheel is the first step toward mastering the art of color. Each color has its own character and emotional resonance.",
                description: "Introduction to the basics of color theory and perception."
            }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find a demo user to associate these books with
        let user = await User.findOne({ email: 'demo@bookforge.com' });
        if (!user) {
            // Create a demo user if it doesn't exist
            user = new User({
                name: "Demo User",
                email: "demo@bookforge.com",
                password: "password123", // Will be hashed by pre-save hook
                isPro: true,
                tier: 'premium'
            });
            await user.save();
            console.log("Demo user created");
        }

        // Delete existing featured books to avoid duplicates if needed
        // await Book.deleteMany({ title: { $in: featuredBooks.map(b => b.title) } });

        for (const bookData of featuredBooks) {
            const existingBook = await Book.findOne({ title: bookData.title });
            if (!existingBook) {
                const book = new Book({
                    ...bookData,
                    userId: user._id,
                    status: 'published'
                });
                await book.save();
                console.log(`Seeded: ${book.title}`);
            } else {
                console.log(`Skipped (already exists): ${bookData.title}`);
            }
        }

        console.log("Seeding completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedDB();
