const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const localApi = require("./local-api");

function registerIpcHandlers() {
  ipcMain.handle("profile:get", () => localApi.getProfile());
  ipcMain.handle("cars:get", () => localApi.getCars());
  ipcMain.handle("market:get", () => localApi.getMarket());
  ipcMain.handle("events:get", () => localApi.getEvents());
  ipcMain.handle("tracks:get", () => localApi.getTracks());
  ipcMain.handle("save:progress", (_event, data) => localApi.saveProgress(data));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.setTitle("Assetto Corsa: GT Edition");
  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
