const { contextBridge } = require("electron");

// Сейчас ничего не пробрасываем, но файл нужен, чтобы не падало
contextBridge.exposeInMainWorld("desktop", {
  // сюда потом можно вытащить всякие функции из main-процесса
});
