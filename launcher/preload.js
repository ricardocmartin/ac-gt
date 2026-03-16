const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gtApi", {
  getProfile: () => ipcRenderer.invoke("profile:get"),
  getCars: () => ipcRenderer.invoke("cars:get"),
  getMarket: () => ipcRenderer.invoke("market:get"),
  getEvents: () => ipcRenderer.invoke("events:get"),
  getTracks: () => ipcRenderer.invoke("tracks:get"),
  saveProgress: (data) => ipcRenderer.invoke("save:progress", data),
});
