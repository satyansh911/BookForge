const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Users/satya/.gemini/antigravity/brain/8aa5c058-0f82-4981-8d91-f9d06029cb4b';
const targetDir = 'd:/New folder/Ebook Project/frontend/BookForge/public/characters';

const mapping = {
  'gojo_portrait_epic_1774445018553.png': 'gojo.png',
  'luffy_portrait_epic_v2_1774445049727.png': 'luffy.png',
  'guts_portrait_epic_v2_1774445065693.png': 'guts.png',
  'denji_portrait_v3_retry_1774445162593.png': 'denji.png',
  'anya_portrait_v3_retry_1774445182603.png': 'anya.png',
  'goku_portrait_v3_retry_1774445206693.png': 'goku.png',
  'tanjiro_portrait_epic_v3_retry_1774445240276.png': 'tanjiro.png',
  'ichigo_portrait_epic_v3_retry_1774445258845.png': 'ichigo.png',
  'naruto_portrait_final_v6_retry_1774445302472.png': 'naruto.png'
};

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

Object.entries(mapping).forEach(([src, dest]) => {
  const srcPath = path.join(sourceDir, src);
  const destPath = path.join(targetDir, dest);
  if (fs.existsSync(srcPath)) {
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${src} to ${dest}`);
    } catch (e) {
      console.error(`Failed to copy ${src}: ${e.message}`);
    }
  } else {
    console.error(`Source not found: ${srcPath}`);
  }
});
