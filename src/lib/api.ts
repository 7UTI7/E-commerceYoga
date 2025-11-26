import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API
});

// Interceptor para manter o login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- TIPAGENS (Isso corrige o erro de Logout) ---
export type UserRole = "STUDENT" | "ADMIN" | "USER";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole; // Aceita STUDENT agora
  phone?: string;
  isVerified?: boolean;
  avatar?: string; // A foto vai aqui
  createdAt?: string;
  updatedAt?: string;
};

// Tipos de Conteúdo
export type Comment = {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string; // Foto nos comentários
  };
  createdAt: string;
  updatedAt: string;
};

export type Article = { _id: string; title: string; slug: string; content: string; coverImage?: string; status: string; createdAt: string; comments?: Comment[]; };
export type Video = { _id: string; title: string; description?: string; youtubeUrl?: string; level?: string; comments?: Comment[]; author?: User; createdAt: string; };
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

// Atualizar Perfil (Envia a foto)
export async function updateMe(payload: { name?: string; phone?: string; email?: string; avatar?: string }) {
  const { data } = await api.put<User>("/api/auth/me", payload);
  return data;
}

export async function updatePassword(payload: { oldPassword: string; newPassword: string }) {
  const { data } = await api.put(`/api/auth/updatepassword`, payload);
  return data;
}

// Upload de Imagem
export async function uploadImage(file: Blob) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<{ message: string; imageUrl: string }>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// E-mails
export async function verifyEmail(token: string) { const { data } = await api.get(`/api/auth/verifyemail/${token}`); return data; }
export async function forgotPassword(email: string) { const { data } = await api.post('/api/auth/forgotpassword', { email }); return data; }
export async function resetPassword(token: string, password: string) { const { data } = await api.put(`/api/auth/resetpassword/${token}`, { password }); return data; }

// Dashboard
export async function getDashboardStats() { const { data } = await api.get('/api/admin/dashboard'); return data; }

// Conteúdo (Getters)
export async function getPublishedArticles() { const { data } = await api.get<Article[]>("/api/articles"); return data; }
export const getArticles = getPublishedArticles;
export async function getVideos() { const { data } = await api.get<Video[]>("/api/videos"); return data; }
export async function getEvents() { const { data } = await api.get<Event[]>("/api/events"); return data; }
export async function getClassSlots() { const { data } = await api.get<ClassSlot[]>("/api/class-slots"); return data; }
export async function getWhatsAppGroups() { const { data } = await api.get<WhatsAppGroup[]>("/api/whatsapp-groups"); return data; }

// Detalhes
export async function getArticleByIdOrSlug(key: string) {
  try { return (await api.get<Article>(`/api/articles/${key}`)).data; }
  catch { return (await api.get<Article>(`/api/articles/slug/${key}`)).data; }
}
export async function getVideoById(id: string) { const { data } = await api.get<Video>(`/api/videos/${id}`); return data; }
export async function getEventById(id: string) { const { data } = await api.get<Event>(`/api/events/${id}`); return data; }
export async function getClassSlotById(id: string) { const { data } = await api.get<ClassSlot>(`/api/class-slots/${id}`); return data; }
export async function getWhatsAppGroupById(id: string) { const { data } = await api.get<WhatsAppGroup>(`/api/whatsapp-groups/${id}`); return data; }
export async function searchContent(query: string) { const { data } = await api.get('/api/search', { params: { q: query } }); return data; }

// Admin CRUD (Simplificado)
export async function createArticle(payload: any) { const { data } = await api.post("/api/articles", payload); return data; }
export async function updateArticle(id: string, payload: any) { const { data } = await api.put(`/api/articles/${id}`, payload); return data; }
export async function deleteArticle(id: string) { const { data } = await api.delete(`/api/articles/${id}`); return data; }
export async function createVideo(payload: any) { const { data } = await api.post("/api/videos", payload); return data; }
export async function updateVideo(id: string, payload: any) { const { data } = await api.put(`/api/videos/${id}`, payload); return data; }
export async function deleteVideo(id: string) { const { data } = await api.delete(`/api/videos/${id}`); return data; }
export async function createEvent(payload: any) { const { data } = await api.post("/api/events", payload); return data; }
export async function updateEvent(id: string, payload: any) { const { data } = await api.put(`/api/events/${id}`, payload); return data; }
export async function deleteEvent(id: string) { const { data } = await api.delete(`/api/events/${id}`); return data; }
export async function createClassSlot(payload: any) { const { data } = await api.post("/api/class-slots", payload); return data; }
export async function updateClassSlot(id: string, payload: any) { const { data } = await api.put(`/api/class-slots/${id}`, payload); return data; }
export async function deleteClassSlot(id: string) { const { data } = await api.delete(`/api/class-slots/${id}`); return data; }
export async function createWhatsAppGroup(payload: any) { const { data } = await api.post("/api/whatsapp-groups", payload); return data; }
export async function updateWhatsAppGroup(id: string, payload: any) { const { data } = await api.put(`/api/whatsapp-groups/${id}`, payload); return data; }
export async function deleteWhatsAppGroup(id: string) { const { data } = await api.delete(`/api/whatsapp-groups/${id}`); return data; }

// Interações
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

export function parseApiError(err: any): string {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return "Erro inesperado.";
}

export default api;