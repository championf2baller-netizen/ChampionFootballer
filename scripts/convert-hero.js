const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imgDir = path.join(process.cwd(), 'src', 'Components', 'images');

async function main() {
  const heroInput = path.join(imgDir, '222.png');
  const heroOutput = path.join(imgDir, '222.webp');
  if (fs.existsSync(heroInput)) {
    const before = fs.statSync(heroInput).size;
    await sharp(heroInput)
      .resize({ width: 680, withoutEnlargement: true })
      .webp({ quality: 68, effort: 6 })
      .toFile(heroOutput);
    const after = fs.statSync(heroOutput).size;
    console.log(`Hero image 222.webp ultra-compressed: ${(before/1024/1024).toFixed(2)} MB -> ${(after/1024).toFixed(1)} KB`);
  }

  const logoInput = path.join(imgDir, 'logonavbar.png');
  const logoOutput = path.join(imgDir, 'logonavbar.webp');
  if (fs.existsSync(logoInput)) {
    await sharp(logoInput)
      .resize({ width: 500, withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 })
      .toFile(logoOutput);
    console.log(`Logo logonavbar.webp compressed: ${(fs.statSync(logoOutput).size/1024).toFixed(1)} KB`);
  }

  const features = ['1stpicc.png', '2ndpicc.png', '3rdpicc.png', '4thpicc.png'];
  for (const f of features) {
    const input = path.join(imgDir, f);
    const parsed = path.parse(f);
    const output = path.join(imgDir, parsed.name + '.webp');
    if (fs.existsSync(input)) {
      await sharp(input)
        .resize({ width: 320, withoutEnlargement: true })
        .webp({ quality: 65, effort: 6 })
        .toFile(output);
      console.log(`Feature ${parsed.name}.webp compressed: ${(fs.statSync(output).size/1024).toFixed(1)} KB`);
    }
  }
}

main().catch(console.error);
