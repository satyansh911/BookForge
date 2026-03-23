const fs = require('fs');
const path = require('path');

const srcFiles = [
    'C:/Users/satya/.gemini/antigravity/brain/dbf8e311-7e74-41cd-a6d1-efb9c52d2c35/typography_cover_1774241510598.png',
    'C:/Users/satya/.gemini/antigravity/brain/dbf8e311-7e74-41cd-a6d1-efb9c52d2c35/grid_systems_cover_1774241526368.png',
    'C:/Users/satya/.gemini/antigravity/brain/dbf8e311-7e74-41cd-a6d1-efb9c52d2c35/art_of_color_cover_1774241542698.png'
];

const destNames = [
    'typography_cover.png',
    'grid_systems_cover.png',
    'art_of_color_cover.png'
];

const destDir = 'd:/New folder/Ebook Project/frontend/BookForge/src/assets';

srcFiles.forEach((src, index) => {
    const dest = path.join(destDir, destNames[index]);
    try {
        fs.copyFileSync(src, dest);
        console.log(`Successfully copied to ${dest}`);
    } catch (err) {
        console.error(`Failed to copy ${src}:`, err.message);
    }
});
