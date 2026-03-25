const fs = require('fs');
const path = require('path');

const userSource = 'd:/New folder/Ebook Project/frontend/BookForge/src/assets/animecharacters';
const generatedSource = 'C:/Users/satya/.gemini/antigravity/brain/8aa5c058-0f82-4981-8d91-f9d06029cb4b';
const targetDir = 'd:/New folder/Ebook Project/frontend/BookForge/public/characters';

const mapping = [
  { src: path.join(userSource, 'gojosaturo.png'), dest: 'gojo.png' },
  { src: path.join(generatedSource, 'luffy_portrait_final_shonen_1774462955743.png'), dest: 'luffy.png' },
  { src: path.join(userSource, 'guts.jpg'), dest: 'guts.jpg' },
  { src: path.join(userSource, 'denji.png'), dest: 'denji.png' },
  { src: path.join(userSource, 'anyaforger.png'), dest: 'anya.png' },
  { src: path.join(userSource, 'songoku.jpeg'), dest: 'goku.jpeg' },
  { src: path.join(userSource, 'tanjiro.jpg'), dest: 'tanjiro.jpg' },
  { src: path.join(userSource, 'ichigo.jpg'), dest: 'ichigo.jpg' },
  { src: path.join(userSource, 'naruto.png'), dest: 'naruto.png' }
];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

mapping.forEach(({ src, dest }) => {
  const destPath = path.join(targetDir, dest);
  if (fs.existsSync(src)) {
    try {
      fs.copyFileSync(src, destPath);
      console.log(`✅ Copied to ${dest}`);
    } catch (e) {
      console.error(`❌ Failed ${dest}: ${e.message}`);
    }
  } else {
    console.warn(`⚠️ Source missing: ${src}`);
  }
});
