import { io } from "socket.io-client";
import { API_URL } from "./http";

export const createSocket = (options = {}) =>
  io(API_URL, { autoConnect: false, ...options });
