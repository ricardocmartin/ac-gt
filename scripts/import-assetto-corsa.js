#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function isDir(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function titleFromCode(code) {
  return code
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectCars(carsDir) {
  const folders = fs.readdirSync(carsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  const cars = [];

  for (const folder of folders) {
    const code = folder.name;
    const uiPath = path.join(carsDir, code, "ui", "ui_car.json");
    const ui = readJsonSafe(uiPath);
    const name =
      (ui && (ui.name || ui.car_name || ui.title)) ||
      titleFromCode(code);
    const brand = (ui && (ui.brand || ui.make || ui.manufacturer)) || null;
    const carClass = (ui && (ui.class || ui.tags || ui.type)) || null;

    cars.push({
      id: cars.length + 1,
      code,
      name,
      brand,
      class: carClass,
    });
  }

  return cars.sort((a, b) => a.name.localeCompare(b.name, "en"));
}

function collectTracks(tracksDir) {
  const trackFolders = fs.readdirSync(tracksDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  const tracks = [];

  for (const folder of trackFolders) {
    const trackCode = folder.name;
    const trackPath = path.join(tracksDir, trackCode);
    const uiRoot = path.join(trackPath, "ui");

    const layouts = [];
    if (isDir(uiRoot)) {
      const entries = fs.readdirSync(uiRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const layoutCode = entry.name;
        const uiTrackPath = path.join(uiRoot, layoutCode, "ui_track.json");
        const ui = readJsonSafe(uiTrackPath);
        layouts.push({
          code: layoutCode,
          name: (ui && (ui.name || ui.track || ui.title)) || titleFromCode(layoutCode),
        });
      }
    }

    const topLevelUi = readJsonSafe(path.join(trackPath, "ui", "ui_track.json"));
    const trackName =
      (topLevelUi && (topLevelUi.name || topLevelUi.track || topLevelUi.title)) ||
      titleFromCode(trackCode);

    tracks.push({
      id: tracks.length + 1,
      code: trackCode,
      name: trackName,
      layouts: layouts.sort((a, b) => a.name.localeCompare(b.name, "en")),
    });
  }

  return tracks.sort((a, b) => a.name.localeCompare(b.name, "en"));
}

function ensureDir(dirPath) {
  if (!isDir(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

function parseArgs(argv) {
  const args = { source: "", outCars: "", outTracks: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--source") args.source = argv[i + 1] || "";
    if (token === "--out-cars") args.outCars = argv[i + 1] || "";
    if (token === "--out-tracks") args.outTracks = argv[i + 1] || "";
  }
  return args;
}

function findDefaultSource(projectRoot) {
  const candidates = [
    process.env.ASSETTO_CORSA_DIR,
    path.join(process.env.HOME || "", ".steam", "steam", "steamapps", "common", "assettocorsa"),
    path.join(process.env.HOME || "", ".local", "share", "Steam", "steamapps", "common", "assettocorsa"),
    path.join(projectRoot, "assettocorsa"),
  ].filter(Boolean);

  return candidates.find((p) => isDir(path.join(p, "content", "cars")) && isDir(path.join(p, "content", "tracks"))) || "";
}

function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const assetsDir = path.join(projectRoot, "assets");
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = args.source || findDefaultSource(projectRoot);

  if (!sourceRoot) {
    console.error("Assetto Corsa source not found.");
    console.error("Use: node scripts/import-assetto-corsa.js --source \"/path/to/assettocorsa\"");
    process.exit(1);
  }

  const carsDir = path.join(sourceRoot, "content", "cars");
  const tracksDir = path.join(sourceRoot, "content", "tracks");
  if (!isDir(carsDir) || !isDir(tracksDir)) {
    console.error(`Invalid source: ${sourceRoot}`);
    console.error("Expected directories: content/cars and content/tracks");
    process.exit(1);
  }

  ensureDir(assetsDir);
  const outCars = args.outCars || path.join(assetsDir, "cars.json");
  const outTracks = args.outTracks || path.join(assetsDir, "tracks.json");

  const cars = collectCars(carsDir);
  const tracks = collectTracks(tracksDir);

  writeJson(outCars, cars);
  writeJson(outTracks, tracks);

  console.log(`Imported ${cars.length} cars -> ${outCars}`);
  console.log(`Imported ${tracks.length} tracks -> ${outTracks}`);
}

main();
