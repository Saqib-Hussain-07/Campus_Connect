import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  // In CRA local development, port 3000 connects to backend port 5000
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    window.location.port === '3000'
  ) {
    return 'http://localhost:5000';
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
};

/**
 * Get or initialize persistent authenticated Socket.IO connection
 */
export const getSocket = () => {
  const token = localStorage.getItem('campusconnect_token');
  if (!token) return null;

  if (!socket || !socket.connected) {
    socket = io(getSocketUrl(), {
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
