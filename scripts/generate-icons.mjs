import fs from "fs";
import path from "path";
import url from "url";
import sharp from "sharp";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const sourceSvg = path.join(publicDir, "logo.svg");

if (!fs.existsSync(sourceSvg)) {
  console.error(`Source SVG not found: ${sourceSvg}`);
  process.exit(1);
}

/**
 * Generate a square PNG icon from an SVG source.
 * @param {number} size - Square size in px.
 * @param {string} outPath - Output PNG path.
 * @param {boolean} flattenToWhite - Whether to flatten on white background.
 */
async function generateIcon(size, outPath, flattenToWhite = false) {
  const pipeline = sharp(sourceSvg)
    .resize(size, size, {
      fit: "contain",
      background: flattenToWhite
        ? { r: 255, g: 255, b: 255, alpha: 1 }
        : { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png();

  const img = flattenToWhite
    ? pipeline.flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
    : pipeline;
  await img.toFile(outPath);
  console.log(
    `Created ${path.relative(projectRoot, outPath)} (${size}x${size})`
  );
}

async function main() {
  const targets = [
    { size: 192, out: path.join(publicDir, "icon-192.png"), flatten: false },
    { size: 512, out: path.join(publicDir, "icon-512.png"), flatten: false },
    {
      size: 180,
      out: path.join(publicDir, "apple-touch-icon.png"),
      flatten: true,
    },
  ];

  for (const t of targets) {
    await generateIcon(t.size, t.out, t.flatten);
  }

  console.log("All icons generated successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
