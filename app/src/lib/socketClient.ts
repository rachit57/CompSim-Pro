import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'], // Allow fallback
});

socket.on('connect', () => console.log('>>> Socket Connected:', socket.id));
socket.on('connect_error', (err) => console.error('!!! Socket Connection Error:', err));
socket.on('disconnect', (reason) => console.log('>>> Socket Disconnected:', reason));
