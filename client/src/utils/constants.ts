export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin

export const DEFAULT_USER = {
  id: 'usr_default_architect',
  name: 'Lead Architect',
  email: 'architect@intellmeet.io',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
}
