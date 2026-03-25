const fs = require('fs');
const path = require('path');

const userSource = 'd:/New folder/Ebook Project/frontend/BookForge/src/assets/animecharacters';
const generatedSource = 'C:/Users/satya/.gemini/antigravity/brain/8aa5c058-0f82-4981-8d91-f9d06029cb4b';
const targetFile = 'd:/New folder/Ebook Project/frontend/BookForge/src/data/characterImages.js';

const mapping = [
  { name: 'gojo', src: path.join(userSource, 'gojosaturo.png') },
  { name: 'luffy', src: path.join(generatedSource, 'luffy_portrait_final_shonen_1774462955743.png') },
  { name: 'guts', src: path.join(userSource, 'guts.jpg') },
  { name: 'denji', src: path.join(userSource, 'denji.png') },
  { name: 'anya', src: path.join(userSource, 'anyaforger.png') },
  { name: 'goku', src: path.join(userSource, 'songoku.jpeg') },
  { name: 'tanjiro', src: path.join(userSource, 'tanjiro.jpg') },
  { name: 'ichigo', src: path.join(userSource, 'ichigo.jpg') },
  { name: 'naruto', src: path.join(userSource, 'naruto.png') }
];

let output = 'export const characterImages = {\n';

mapping.forEach(({ name, src }) => {
  if (fs.existsSync(src)) {
    try {
      const ext = path.extname(src).substring(1).replace('jpg', 'jpeg');
      const base64 = fs.readFileSync(src).toString('base64');
      output += `  ${name}: "data:image/${ext};base64,${base64}",\n`;
      console.log(`✅ Processed ${name}`);
    } catch (e) {
      console.error(`❌ Failed ${name}: ${e.message}`);
    }
  } else {
    console.warn(`⚠️ Source missing: ${src}`);
  }
});

output += '};\n';
fs.writeFileSync(targetFile, output);
console.log('✅ characterImages.js generated');
