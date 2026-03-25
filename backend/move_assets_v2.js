const fs = require('fs');
const path = require('path');

const targetDir = 'd:/New folder/Ebook Project/frontend/BookForge/public/characters';
const sourceDir = 'C:/Users/satya/.gemini/antigravity/brain/8aa5c058-0f82-4981-8d91-f9d06029cb4b';

const assets = [
    { src: 'gojo_portrait_epic_1774445018553.png', dest: 'gojo.png' },
    { src: 'luffy_portrait_epic_v2_1774445049727.png', dest: 'luffy.png' },
    { src: 'guts_portrait_epic_v2_1774445065693.png', dest: 'guts.png' },
    { src: 'denji_portrait_v3_retry_1774445162593.png', dest: 'denji.png' },
    { src: 'anya_portrait_v3_retry_1774445182603.png', dest: 'anya.png' },
    { src: 'goku_portrait_v3_retry_1774445206693.png', dest: 'goku.png' },
    { src: 'tanjiro_portrait_epic_v3_retry_1774445240276.png', dest: 'tanjiro.png' },
    { src: 'ichigo_portrait_epic_v3_retry_1774445258845.png', dest: 'ichigo.png' },
    { src: 'naruto_portrait_final_v6_retry_1774445302472.png', dest: 'naruto.png' }
];

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

assets.forEach(asset => {
    const srcPath = path.join(sourceDir, asset.src);
    const destPath = path.join(targetDir, asset.dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${asset.dest}`);
    } else {
        console.error(`Source not found: ${srcPath}`);
    }
});
