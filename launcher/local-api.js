const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATABASE_DIR = path.join(PROJECT_ROOT, "database");
const SAVEGAME_PATH = path.join(DATABASE_DIR, "savegame.json");
const CARS_PATH = path.join(PROJECT_ROOT, "assets", "cars.json");
const EVENTS_PATH = path.join(PROJECT_ROOT, "assets", "events.json");
const TRACKS_PATH = path.join(PROJECT_ROOT, "assets", "tracks.json");

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function buildDefaultState() {
  const cars = readJson(CARS_PATH, []).map((car) => ({
    id: car.id,
    name: car.name,
    owned: false,
  }));

  return {
    profile: {
      name: "Player",
      credits: 10000,
      progress: 0,
    },
    cars,
  };
}

function ensureState() {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
  }

  if (!fs.existsSync(SAVEGAME_PATH)) {
    fs.writeFileSync(SAVEGAME_PATH, JSON.stringify(buildDefaultState(), null, 2));
    return;
  }

  const state = readJson(SAVEGAME_PATH, null);
  if (!state || !state.profile || !Array.isArray(state.cars)) {
    fs.writeFileSync(SAVEGAME_PATH, JSON.stringify(buildDefaultState(), null, 2));
  }
}

function readState() {
  ensureState();
  return readJson(SAVEGAME_PATH, buildDefaultState());
}

function writeState(state) {
  fs.writeFileSync(SAVEGAME_PATH, JSON.stringify(state, null, 2));
}

function getProfile() {
  return readState().profile;
}

function getCars() {
  return readState().cars.filter((car) => car.owned);
}

function getMarket() {
  return readState().cars.map((car) => ({ id: car.id, name: car.name }));
}

function getEvents() {
  return readJson(EVENTS_PATH, []);
}

function getTracks() {
  return readJson(TRACKS_PATH, []);
}

function saveProgress({ credits, progress }) {
  const state = readState();
  state.profile.credits = Number(credits);
  state.profile.progress = Number(progress);
  writeState(state);
  return { status: "ok" };
}

module.exports = {
  getProfile,
  getCars,
  getMarket,
  getEvents,
  getTracks,
  saveProgress,
};
