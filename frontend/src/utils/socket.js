import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const isValidUrl =
  typeof socketUrl === "string" &&
  socketUrl.length > 0 &&
  (socketUrl.startsWith("http://") || socketUrl.startsWith("https://"));

export const socket = isValidUrl
  ? io(socketUrl, { transports: ["websocket"], autoConnect: true })
  : { on: () => {}, off: () => {}, emit: () => {} };
