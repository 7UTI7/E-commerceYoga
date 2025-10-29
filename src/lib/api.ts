// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API, // ex.: https://seu-backend.onrender.com
});

// Injeta token (se existir) em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------- Tipos --------------------
export type Article = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  status: "DRAFT" | "PUBLISHED";
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
  // alguns backends usam youtubeUrl
  youtubeUrl?: string;
  category?: string;
};

export type Event = {
  _id: string;
  title: string;
  date: string;          // ISO
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClassSlot = {
  _id: string;
  // modelo novo já em uso
  title: string;
  description?: string;
  dateTime: string; // ISO
  durationMinutes?: number;
  maxStudents?: number;

  // campos legados (ignorados se não existirem)
  weekday?: number;
  time?: string;
  modality?: string;

  createdAt: string;
  updatedAt: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
};

// -------------------- Auth --------------------
export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data; // { user, token } ou { user }
}
export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // { user, token }
}

// -------------------- Listagens públicas --------------------
export async function getPublishedArticles() {
  const { data } = await api.get<Article[]>("/api/articles");
  return data;
}
export async function getArticles() {
  return getPublishedArticles();
}

export async function getVideos() {
  const { data } = await api.get<Video[]>("/api/videos");
  return data;
}
export async function getEvents() {
  const { data } = await api.get<Event[]>("/api/events");
  return data;
}
export async function getClassSlots() {
  const { data } = await api.get<ClassSlot[]>("/api/class-slots");
  return data;
}

// -------------------- Get by ID (detalhe) --------------------
export async function getArticleById(id: string) {
  const { data } = await api.get<Article>(`/api/articles/${id}`);
  return data;
}
export async function getVideoById(id: string) {
  const { data } = await api.get<Video>(`/api/videos/${id}`);
  return data;
}
export async function getEventById(id: string) {
  const { data } = await api.get<Event>(`/api/events/${id}`);
  return data;
}
export async function getClassSlotById(id: string) {
  const { data } = await api.get<ClassSlot>(`/api/class-slots/${id}`);
  return data;
}

// -------------------- CRUD Artigos --------------------
export async function createArticle(payload: Partial<Article>) {
  const { data } = await api.post<Article>("/api/articles", payload);
  return data;
}
export async function updateArticle(id: string, payload: Partial<Article>) {
  const { data } = await api.put<Article>(`/api/articles/${id}`, payload);
  return data;
}
export async function deleteArticle(id: string) {
  const { data } = await api.delete(`/api/articles/${id}`);
  return data;
}

// -------------------- CRUD Vídeos --------------------
export async function createVideo(payload: Partial<Video>) {
  const { data } = await api.post<Video>("/api/videos", payload);
  return data;
}
export async function updateVideo(id: string, payload: Partial<Video>) {
  const { data } = await api.put<Video>(`/api/videos/${id}`, payload);
  return data;
}
export async function deleteVideo(id: string) {
  const { data } = await api.delete(`/api/videos/${id}`);
  return data;
}

// -------------------- CRUD Eventos --------------------
export async function createEvent(payload: Partial<Event>) {
  const { data } = await api.post<Event>("/api/events", payload);
  return data;
}
export async function updateEvent(id: string, payload: Partial<Event>) {
  const { data } = await api.put<Event>(`/api/events/${id}`, payload);
  return data;
}
export async function deleteEvent(id: string) {
  const { data } = await api.delete(`/api/events/${id}`);
  return data;
}

// -------------------- CRUD Aulas (Class Slots) --------------------
export async function createClassSlot(payload: {
  title: string;
  description?: string;
  dateTime: string;
  durationMinutes?: number;
  maxStudents?: number;
}) {
  const { data } = await api.post("/api/class-slots", payload);
  return data;
}
export async function updateClassSlot(id: string, payload: Partial<ClassSlot>) {
  const { data } = await api.put<ClassSlot>(`/api/class-slots/${id}`, payload);
  return data;
}
export async function deleteClassSlot(id: string) {
  const { data } = await api.delete(`/api/class-slots/${id}`);
  return data;
}

// -------------------- Perfil do Usuário (aluno) --------------------
// Convenção comum de backends Node: /api/users/me (GET/PUT) e, às vezes, /api/users/me/password.
// Se o seu backend usar outro caminho, troque aqui e pronto.
export async function getMe() {
  const { data } = await api.get<User>("/api/users/me");
  return data;
}

export async function updateMe(payload: {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const { data } = await api.put<User>("/api/users/me", payload);
  return data;
}

export default api;
