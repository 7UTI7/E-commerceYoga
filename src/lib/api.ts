import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API
});

// --- INTERCEPTOR DE TOKEN ---
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("auth_token");
  if (!token) {
    token = sessionStorage.getItem("auth_token");
  }
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- TIPAGENS DA SPRINT 5 ---

// AGORA ACEITA "STUDENT" PARA NÃO DESLOGAR
export type UserRole = "STUDENT" | "ADMIN" | "USER";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isVerified?: boolean;
  avatar?: string; // Campo da foto
  createdAt?: string;
  updatedAt?: string;
};

export type Comment = {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type Video = {
  _id: string;
  title: string;
  url?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  youtubeUrl?: string;
  category?: string;
  level?: string;
  comments?: Comment[];
  author?: User;
};

export type Article = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
};

export type Event = { _id: string; title: string; date: string; location?: string; description?: string; image?: string; };
export type ClassSlot = { _id: string; title: string; description?: string; dateTime: string; durationMinutes?: number; level?: string; modality?: string; };
export type WhatsAppGroup = { _id: string; name: string; description?: string; joinLink: string; };

// --- AUTH ---

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

// Atualiza e retorna o usuário atualizado (CRÍTICO PARA O PERFIL)
export async function updateMe(payload: { name?: string; phone?: string; email?: string; avatar?: string }) {
  const { data } = await api.put<User>("/api/auth/me", payload);
  return data;
}

export async function updatePassword(payload: { oldPassword: string; newPassword: string }) {
  const { data } = await api.put(`/api/auth/updatepassword`, payload);
  return data;
}

// --- UPLOAD ---
export async function uploadImage(file: Blob) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<{ message: string; imageUrl: string }>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// --- E-MAILS ---
export async function verifyEmail(token: string) {
  const { data } = await api.get(`/api/auth/verifyemail/${token}`);
  return data;
}
export async function forgotPassword(email: string) {
  const { data } = await api.post('/api/auth/forgotpassword', { email });
  return data;
}
export async function resetPassword(token: string, password: string) {
  const { data } = await api.put(`/api/auth/resetpassword/${token}`, { password });
  return data;
}

// --- DASHBOARD ---
export async function getDashboardStats() {
  const { data } = await api.get('/api/admin/dashboard');
  return data;
}

// --- GET CONTENT ---
export async function getPublishedArticles() { const { data } = await api.get<Article[]>("/api/articles"); return data; }
export const getArticles = getPublishedArticles;
export async function getVideos() { const { data } = await api.get<Video[]>("/api/videos"); return data; }
export async function getEvents() { const { data } = await api.get<Event[]>("/api/events"); return data; }
export async function getClassSlots() { const { data } = await api.get<ClassSlot[]>("/api/class-slots"); return data; }
export async function getWhatsAppGroups() { const { data } = await api.get<WhatsAppGroup[]>("/api/whatsapp-groups"); return data; }

// --- GET DETAILS ---
export async function getArticleByIdOrSlug(key: string) {
  try { return (await api.get<Article>(`/api/articles/${key}`)).data; }
  catch { return (await api.get<Article>(`/api/articles/slug/${key}`)).data; }
}
export async function getVideoById(id: string) { const { data } = await api.get<Video>(`/api/videos/${id}`); return data; }
export async function getEventById(id: string) { const { data } = await api.get<Event>(`/api/events/${id}`); return data; }
export async function getClassSlotById(id: string) { const { data } = await api.get<ClassSlot>(`/api/class-slots/${id}`); return data; }
export async function getWhatsAppGroupById(id: string) { const { data } = await api.get<WhatsAppGroup>(`/api/whatsapp-groups/${id}`); return data; }

export async function searchContent(query: string) {
  const { data } = await api.get('/api/search', { params: { q: query } });
  return data;
}

// --- INTERACTIONS ---
export async function createArticleComment(articleId: string, content: string) {
  const { data } = await api.post<Comment>(`/api/articles/${articleId}/comments`, { content });
  return data;
}
export async function createVideoComment(videoId: string, content: string) {
  const { data } = await api.post<Comment>(`/api/videos/${videoId}/comments`, { content });
  return data;
}
export async function toggleFavoriteVideo(videoId: string) {
  const { data } = await api.post(`/api/videos/${videoId}/favorite`);
  return data;
}
export async function getMyFavoriteVideos() {
  const { data } = await api.get<Video[]>("/api/auth/me/favorites");
  return data;
}

export default api;