import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API, // ex.: https://api-yoga-rapha.onrender.com
});

// Anexa token automaticamente quando existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  url: string;            // você usou "url" no tipo — beleza
  description?: string;
  createdAt: string;
  updatedAt: string;
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
  weekday: number;       // 0-6
  time: string;          // "19:00"
  modality?: string;     // ex.: Hatha, Yin...
  createdAt: string;
  updatedAt: string;
};

// -------- Auth --------
export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data; // { user, token } ou { user }
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // { user, token }
}

// -------- Público --------
export async function getPublishedArticles() {
  const { data } = await api.get<Article[]>("/api/articles");
  return data;
}
// alias para a UI que importa getArticles()
export { getPublishedArticles as getArticles };

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

// -------- Admin (token via interceptor) --------
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

// Vídeos
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

// Eventos
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

// Aulas (Class-Slots)
export async function createClassSlot(payload: Partial<ClassSlot>) {
  const { data } = await api.post<ClassSlot>("/api/class-slots", payload);
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

export default api;
