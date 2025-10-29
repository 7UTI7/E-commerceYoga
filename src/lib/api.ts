import axios from "axios";

export type Article = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type Video = {
  _id: string;
  title: string;
  youtubeId: string;
  description?: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type ClassSlot = {
  _id: string;
  title: string;
  description: string;
  dateTime: string;
  durationMinutes?: number;
  maxStudents?: number;
  createdAt: string;
  updatedAt: string;
  author: string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
      return;
    }
    return Promise.reject(err);
  }
);

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function getPublishedArticles() {
  const { data } = await api.get<Article[]>("/api/articles");
  return data;
}

export async function getArticles() {
  const { data } = await api.get<Article[]>("/api/articles/admin");
  return data;
}

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

export async function getVideos() {
  const { data } = await api.get<Video[]>("/api/videos/admin");
  return data;
}

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

export async function getEvents() {
  const { data } = await api.get<Event[]>("/api/events/admin");
  return data;
}

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

export async function getClassSlots() {
  const { data } = await api.get<ClassSlot[]>("/api/class-slots");
  return data;
}

export async function createClassSlot(payload: {
  title: string;
  description: string;
  dateTime: string;
  durationMinutes?: number;
  maxStudents?: number;
}) {
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
