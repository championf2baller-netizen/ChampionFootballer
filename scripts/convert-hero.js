const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imgDir = path.join(process.cwd(), 'src', 'Components', 'images');

async function convertImage(fileName, quality = 82) {
  const inputPath = path.join(imgDir, fileName);
  const parsed = path.parse(fileName);
  const outputPath = path.join(imgDir, parsed.name + '.webp');

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    return;
  }

  const statBefore = fs.statSync(inputPath);
  console.log(`Converting ${fileName} (${(statBefore.size / 1024).toFixed(1)} KB)...`);

  await sharp(inputPath)
    .webp({ quality, effort: 6 })
    .toFile(outputPath);

  const statAfter = fs.statSync(outputPath);
  console.log(`Saved ${parsed.name}.webp (${(statAfter.size / 1024).toFixed(1)} KB) - Reduced by ${(((statBefore.size - statAfter.size) / statBefore.size) * 100).toFixed(1)}%`);
}

async function main() {
  await convertImage('logonavbar.png', 80);
  await convertImage('championfootballnewlogo.png', 80);
}

main().catch(err => console.error(err));
