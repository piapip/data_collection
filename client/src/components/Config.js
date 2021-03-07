//SERVER ROUTES
export const USER_SERVER = '/api/users';
export const ROOM_SERVER = '/api/chatroom';
export const AUDIO_SERVER = '/api/audio';
export const MESSAGE_SERVER = '/api/message';
export const BACKEND_URL = process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : 'http://localhost:5000';
// export const BACKEND_URL = process.env.NODE_ENV === "production" ? process.env.PORT : 5000;
export const COLOR = ['Không có', 'Trắng', 'Vàng', 'Trong suốt'];