const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Character = require('./models/Character');
const connectDB = require('./config/db');

const initialCharacters = [
    { name: "Gojo Satoru", mangaTitle: "Jujutsu Kaisen", image: "gojo.png", votes: 100 },
    { name: "Monkey D. Luffy", mangaTitle: "One Piece", image: "luffy.jpeg", votes: 100 },
    { name: "Guts", mangaTitle: "Berserk", image: "guts.jpg", votes: 100 },
    { name: "Denji", mangaTitle: "Chainsaw Man", image: "denji.png", votes: 100 },
    { name: "Anya Forger", mangaTitle: "Spy x Family", image: "anya.png", votes: 100 },
    { name: "Son Goku", mangaTitle: "Dragon Ball Z", image: "goku.jpeg", votes: 100 },
    { name: "Tanjiro Kamado", mangaTitle: "Demon Slayer", image: "tanjiro.jpg", votes: 100 },
    { name: "Ichigo Kurosaki", mangaTitle: "Bleach", image: "ichigo.jpg", votes: 100 },
    { name: "Naruto Uzumaki", mangaTitle: "Naruto", image: "naruto.png", votes: 100 },
    { name: "Eren Yeager", mangaTitle: "Attack on Titan", image: "eren.jpg", votes: 100 },
    { name: "Ken Kaneki", mangaTitle: "Tokyo Ghoul", image: "kaneki.jpg", votes: 100 },
    { name: "Saitama", mangaTitle: "One Punch Man", image: "saitama.jpg", votes: 100 },
    { name: "Roronoa Zoro", mangaTitle: "One Piece", image: "zoro.jpg", votes: 100 },
];

const seedCharacters = async () => {
    try {
        await connectDB();
        await Character.deleteMany();
        const inserted = await Character.insertMany(initialCharacters);
        console.log(`✅ Seeded ${inserted.length} characters`);
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding characters:', error);
        process.exit(1);
    }
};

seedCharacters();
