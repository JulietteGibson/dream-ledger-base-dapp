import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  bg: "#f4efe7",
  paper: "#fffaf0",
  panel: "#fff4df",
  ink: "#241b2f",
  line: "#c7bca7",
  lavender: "#d7cdfd",
  mint: "#c5efe7",
  purple: "#8b5cf6",
  blue: "#2563eb",
  gold: "#d69b39",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function frame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <circle cx="1080" cy="210" r="220" fill="${c.lavender}"/>
    <circle cx="150" cy="2520" r="260" fill="${c.mint}"/>
    <path d="M0 520H1284M0 1040H1284M0 1560H1284M0 2080H1284" stroke="rgba(36,27,47,0.06)" stroke-width="3"/>
    ${content}
  </svg>`;
}

function titleBlock(title, subtitle) {
  return `
    <text x="72" y="126" font-family="Courier New, monospace" font-size="32" font-weight="900" fill="#6f5d8f">DREAM LEDGER</text>
    <text x="72" y="238" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="78" y="300" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#6f5d8f">${esc(subtitle)}</text>
  `;
}

function moon(x, y, r, color = c.ink) {
  return `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>
    <circle cx="${x + r * 0.35}" cy="${y - r * 0.1}" r="${r * 0.9}" fill="${c.paper}"/>
  `;
}

function dreamCard(x, y, title, mood, place, fragment, accent = c.purple) {
  const fragmentLines = wrap(fragment, 34).slice(0, 5);
  return `
    <rect x="${x}" y="${y}" width="1060" height="1080" rx="34" fill="${c.paper}" stroke="${c.line}" stroke-width="5"/>
    <circle cx="${x + 920}" cy="${y + 115}" r="82" fill="${c.lavender}"/>
    ${moon(x + 920, y + 115, 44, c.ink)}
    <text x="${x + 54}" y="${y + 88}" font-family="Courier New, monospace" font-size="26" font-weight="900" fill="#6f5d8f">DREAM ENTRY</text>
    <text x="${x + 54}" y="${y + 210}" font-family="Arial, sans-serif" font-size="80" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <rect x="${x + 54}" y="${y + 260}" width="220" height="72" rx="36" fill="${accent}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 164}" y="${y + 307}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${c.paper}">${esc(mood)}</text>
    <rect x="${x + 54}" y="${y + 400}" width="952" height="160" rx="22" fill="${c.panel}" stroke="${c.line}" stroke-width="4"/>
    <text x="${x + 88}" y="${y + 456}" font-family="Courier New, monospace" font-size="24" font-weight="900" fill="#6f5d8f">DREAM PLACE</text>
    <text x="${x + 88}" y="${y + 514}" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">${esc(place)}</text>
    <rect x="${x + 54}" y="${y + 620}" width="952" height="270" rx="22" fill="#fffcf6" stroke="${c.line}" stroke-width="4"/>
    <text x="${x + 88}" y="${y + 680}" font-family="Courier New, monospace" font-size="24" font-weight="900" fill="#6f5d8f">FRAGMENT</text>
    ${fragmentLines.map((line, i) => `<text x="${x + 88}" y="${y + 738 + i * 42}" font-family="Arial, sans-serif" font-size="31" font-weight="800" fill="${c.ink}">${esc(line)}</text>`).join("")}
    <rect x="${x + 54}" y="${y + 950}" width="952" height="72" rx="20" fill="${c.ink}"/>
    <text x="${x + 88}" y="${y + 998}" font-family="Courier New, monospace" font-size="24" font-weight="900" fill="${c.lavender}">DREAMER + TIMESTAMP SAVED ON BASE</text>
  `;
}

function feature(x, y, title, body, accent) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="24" fill="${c.paper}" stroke="${c.line}" stroke-width="5"/>
    <rect x="${x}" y="${y}" width="540" height="14" rx="7" fill="${accent}"/>
    <text x="${x + 34}" y="${y + 80}" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 30).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#6f5d8f">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return frame(`
    ${titleBlock("Save a dream.", "Write the title, mood, place, and fragment before it fades.")}
    ${dreamCard(112, 430, "Glass Staircase", "Lucid", "A quiet station above the ocean", "I found a staircase made of glass. Every step played a soft note, and the train below waited without tracks.", c.blue)}
    ${feature(72, 1630, "Mood tag", "Lucid, soft, strange, or golden.", c.lavender)}
    ${feature(672, 1630, "On Base", "Wallet and timestamp stay readable.", c.mint)}
  `);
}

function screenshot2() {
  return frame(`
    ${titleBlock("Keep the scene.", "Capture the place and fragment in a clean one-page record.")}
    ${feature(72, 385, "Dream place", "The setting anchors the memory.", c.mint)}
    ${feature(672, 385, "Fragment", "Short enough to read in one breath.", c.lavender)}
    ${dreamCard(112, 730, "Paper Orchard", "Soft", "A hill covered in folded trees", "The leaves were envelopes. Each one opened to a map of a city I almost remembered.", "#256f64")}
  `);
}

function screenshot3() {
  return frame(`
    ${titleBlock("Reload any dream.", "Use Dream ID to reopen the entry and verify the Base transaction.")}
    ${feature(72, 385, "Dream ID", "Read saved entries by number.", c.lavender)}
    ${feature(672, 385, "BaseScan", "Open the transaction after saving.", c.gold)}
    ${dreamCard(112, 730, "Sunken Library", "Golden", "A bright room under blue water", "Books floated from shelf to shelf. When I touched one, it turned into a small sun.", c.gold)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="134" y="132" width="756" height="760" rx="82" fill="${c.paper}" stroke="${c.ink}" stroke-width="28"/>
    <circle cx="692" cy="300" r="150" fill="${c.lavender}"/>
    ${moon(690, 300, 92, c.ink)}
    <path d="M278 610H746" stroke="${c.ink}" stroke-width="36" stroke-linecap="round"/>
    <path d="M278 710H620" stroke="${c.purple}" stroke-width="30" stroke-linecap="round"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <circle cx="1720" cy="135" r="230" fill="${c.lavender}"/>
    <text x="96" y="170" font-family="Arial, sans-serif" font-size="126" font-weight="900" fill="${c.ink}">Dream Ledger</text>
    <text x="104" y="250" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#6f5d8f">Save dream fragments on Base.</text>
    ${feature(106, 370, "Dream entry", "Title, mood, place, fragment.", c.lavender)}
    ${feature(106, 635, "Onchain memory", "Wallet and timestamp saved.", c.mint)}
    ${dreamCard(760, 74, "Glass Staircase", "Lucid", "A quiet station above the ocean", "I found a staircase made of glass. Every step played a soft note.", c.blue)}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(
  join(outDir, "asset-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2),
  "utf8",
);

await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Dream Ledger",
    "",
    "App Name: Dream Ledger",
    "Tagline: Save a dream",
    "Description: Save a dream title, mood, place, fragment, wallet, and timestamp on Base.",
    "",
    "Domain: https://dream-ledger.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
