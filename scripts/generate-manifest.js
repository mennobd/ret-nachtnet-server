const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROUTES_DIR = path.join(__dirname, "..", "routes");
const OUTPUT_PATH = path.join(ROUTES_DIR, "manifest.json");

const BASE_URL = "https://ret-nachtnet-server-production.up.railway.app/routes";

// mappen die we scannen
const FOLDERS = [
  { name: "actief", type: "Regulier" },
  { name: "omleidingen", type: "Omleiding" },
  { name: "test", type: "Test" }
];

// simpele parser (kunnen we later slimmer maken)
function parseMetadata(fileName, type) {
  const clean = fileName.replace(".gpx", "");

  const lineMatch = clean.match(/(N\d{2})/i);

  return {
    lineNumber: lineMatch ? lineMatch[1].toUpperCase() : "UNK",
    title: clean,
    type,
    version: "1.0.0",
    active: true
  };
}

function cleanRouteId(fileName) {
  return fileName
    .replace(".gpx", "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function getChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function buildManifest() {
  const routes = [];

  FOLDERS.forEach(folder => {
    const folderPath = path.join(ROUTES_DIR, folder.name);

    if (!fs.existsSync(folderPath)) return;

    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
      if (!file.endsWith(".gpx")) return;

      const fullPath = path.join(folderPath, file);

      const metadata = parseMetadata(file, folder.type);
      const clean = file.replace(".gpx", "");

      routes.push({
        routeId: metadata.lineNumber !== "UNK" ? metadata.lineNumber : cleanRouteId(file),
        lineNumber: metadata.lineNumber,
        title: metadata.title,
        packageName: "RET_NACHTNET",
        type: metadata.type,
        version: metadata.version,
        active: metadata.active,
        fileName: file,
        fileUrl: `${BASE_URL}/${folder.name}/${encodeURIComponent(file)}`,
        checksum: getChecksum(fullPath)
      });
    });
  });

  return {
    manifestVersion: 1,
    generatedAt: new Date().toISOString(),
    packageName: "RET_NACHTNET",
    routes
  };
}

function run() {
  const manifest = buildManifest();

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

  console.log(`✅ Manifest gegenereerd: ${manifest.routes.length} routes`);
}

run();