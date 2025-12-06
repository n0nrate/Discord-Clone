import { createSocket } from "./socket";

// Простой менеджер сокета: lifecycle, подписка на комнаты, авто-reconnect
class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.pendingRooms = new Set();
    this.handlers = {};
    this.onConnectCbs = [];
    this.reconnectDelay = 500;
    this.maxReconnect = 5000;
    this.init();
  }

  init() {
    this.socket = createSocket({ autoConnect: true });

    this.socket.on("connect", () => {
      this.connected = true;
      this.resubscribe();
      this.onConnectCbs.forEach((cb) => cb());
    });

    this.socket.on("disconnect", () => {
      this.connected = false;
      this.scheduleReconnect();
    });
  }

  onReconnect(cb) {
    this.onConnectCbs.push(cb);
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    setTimeout(() => {
      if (!this.connected) {
        this.socket.connect();
      }
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnect);
  }

  joinRoom(room) {
    this.pendingRooms.add(room);
    if (this.connected) {
      this.socket.emit("join-channel", room);
    }
  }

  leaveRoom(room) {
    this.pendingRooms.delete(room);
    if (this.connected) {
      this.socket.emit("leave-channel", room);
    }
  }

  resubscribe() {
    this.pendingRooms.forEach((room) => {
      this.socket.emit("join-channel", room);
    });
  }

  on(event, cb) {
    this.socket.on(event, cb);
    this.handlers[event] = cb;
  }

  off(event, cb) {
    this.socket.off(event, cb || this.handlers[event]);
    delete this.handlers[event];
  }
}

export const socketManager = new SocketManager();
