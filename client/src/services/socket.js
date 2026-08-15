import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or initialize persistent authenticated Socket.IO connection
 */
export const getSocket = () => {
  const token = localStorage.getItem('campusconnect_token');
  if (!token) return null;

  if (!socket || !socket.connected) {
    socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
