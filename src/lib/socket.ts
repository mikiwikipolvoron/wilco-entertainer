import { io, Socket } from 'socket.io-client';
import type { ClientEvent, ServerEvent } from 'shared-types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://192.168.0.7:4000", {
    transports: ["websocket"], 
  });

  }
  return socket;
}

export function emitClientEvent(event: ClientEvent) {
  const s = getSocket();
  console.log("Sending client event", event);
  s.emit('client_event', event);
}

export function onServerEvent(handler: (event: ServerEvent) => void) {
  const s = getSocket();
  console.log("Received server event to handle");
  s.on('server_event', handler);
}