const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/satya/.gemini/antigravity/brain/dbf8e311-7e74-41cd-a6d1-efb9c52d2c35';
const destDir = 'd:/New folder/Ebook Project/frontend/BookForge/public';

const files = {
    'typography_cover_1774241510598.png': 'typography_cover.png',
    'grid_systems_cover_1774241526368.png': 'grid_systems_cover.png',
    'art_of_color_cover_1774241542698.png': 'art_of_color_cover.png'
};

for (const [src, dest] of Object.entries(files)) {
    const srcPath = srcDir + '/' + src;
    const destPath = destDir + '/' + dest;
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Successfully copied to ${destPath}`);
        } else {
            console.log(`Source not found: ${srcPath}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}
