import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API
});

// Interceptor para anexar o Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- TIPAGENS ---
// Aceitamos as duas roles para evitar conflito
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
  author: { _id: string; name: string; avatar?: string; };
  createdAt: string;
  updatedAt: string;
};

// Tipos simplificados para evitar erros de build
export type Article = any;
export type Video = any;
export type Event = any;
export type ClassSlot = any;
export type WhatsAppGroup = any;

// --- FUNÇÕES DE USUÁRIO ---

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  // Retorna o objeto do usuário + token
  return data;
}

export async function getMe() {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

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

// --- CONTEÚDO ---
export async function getPublishedArticles() { const { data } = await api.get("/api/articles"); return data; }
export const getArticles = getPublishedArticles;
export async function getVideos() { const { data } = await api.get("/api/videos"); return data; }
export async function getEvents() { const { data } = await api.get("/api/events"); return data; }
export async function getClassSlots() { const { data } = await api.get("/api/class-slots"); return data; }
export async function getWhatsAppGroups() { const { data } = await api.get("/api/whatsapp-groups"); return data; }

// --- DETALHES ---
export async function getArticleByIdOrSlug(key: string) {
  try { return (await api.get(`/api/articles/${key}`)).data; }
  catch { return (await api.get(`/api/articles/slug/${key}`)).data; }
}
export async function getVideoById(id: string) { const { data } = await api.get(`/api/videos/${id}`); return data; }
export async function getEventById(id: string) { const { data } = await api.get(`/api/events/${id}`); return data; }
export async function getClassSlotById(id: string) { const { data } = await api.get(`/api/class-slots/${id}`); return data; }
export async function getWhatsAppGroupById(id: string) { const { data } = await api.get(`/api/whatsapp-groups/${id}`); return data; }

export async function searchContent(query: string) {
  const { data } = await api.get('/api/search', { params: { q: query } });
  return data;
}

// --- ADMIN ---
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

// --- INTERAÇÕES ---
export async function createArticleComment(articleId: string, content: string) {
  const { data } = await api.post(`/api/articles/${articleId}/comments`, { content });
  return data;
}
export async function createVideoComment(videoId: string, content: string) {
  const { data } = await api.post(`/api/videos/${videoId}/comments`, { content });
  return data;
}
export async function toggleFavoriteVideo(videoId: string) {
  const { data } = await api.post(`/api/videos/${videoId}/favorite`);
  return data;
}
export async function getMyFavoriteVideos() {
  const { data } = await api.get("/api/auth/me/favorites");
  return data;
}

export function parseApiError(err: any): string {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return "Erro inesperado. Tente novamente.";
}

export default api;