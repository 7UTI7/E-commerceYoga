import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type Article = {
  _id: string
  title: string
  slug: string
  content: string
  coverImage?: string
  tags?: string[]
  status: "DRAFT" | "PUBLISHED"
  createdAt: string
  updatedAt: string
}

export type Video = {
  _id: string
  title: string
  url?: string
  description?: string
  createdAt: string
  updatedAt: string
  youtubeUrl?: string
  category?: string
}

export type Event = {
  _id: string
  title: string
  date: string
  location?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type ClassSlot = {
  _id: string
  title: string
  description?: string
  dateTime: string
  durationMinutes?: number
  maxStudents?: number
  weekday?: number
  time?: string
  modality?: string
  createdAt: string
  updatedAt: string
}

export type User = {
  _id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password })
  return data
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password })
  return data
}

export async function getPublishedArticles() {
  const { data } = await api.get<Article[]>("/api/articles")
  return data
}

export async function getArticles() {
  return getPublishedArticles()
}

export async function getVideos() {
  const { data } = await api.get<Video[]>("/api/videos")
  return data
}

export async function getEvents() {
  const { data } = await api.get<Event[]>("/api/events")
  return data
}

export async function getClassSlots() {
  const { data } = await api.get<ClassSlot[]>("/api/class-slots")
  return data
}

export async function getArticleById(id: string) {
  const { data } = await api.get<Article>(`/api/articles/${id}`)
  return data
}

export async function getVideoById(id: string) {
  const { data } = await api.get<Video>(`/api/videos/${id}`)
  return data
}

export async function getEventById(id: string) {
  const { data } = await api.get<Event>(`/api/events/${id}`)
  return data
}

export async function getClassSlotById(id: string) {
  const { data } = await api.get<ClassSlot>(`/api/class-slots/${id}`)
  return data
}

export async function createArticle(payload: Partial<Article>) {
  const { data } = await api.post<Article>("/api/articles", payload)
  return data
}

export async function updateArticle(id: string, payload: Partial<Article>) {
  const { data } = await api.put<Article>(`/api/articles/${id}`, payload)
  return data
}

export async function deleteArticle(id: string) {
  const { data } = await api.delete(`/api/articles/${id}`)
  return data
}

export async function createVideo(payload: Partial<Video>) {
  const { data } = await api.post<Video>("/api/videos", payload)
  return data
}

export async function updateVideo(id: string, payload: Partial<Video>) {
  const { data } = await api.put<Video>(`/api/videos/${id}`, payload)
  return data
}

export async function deleteVideo(id: string) {
  const { data } = await api.delete(`/api/videos/${id}`)
  return data
}

export async function createEvent(payload: Partial<Event>) {
  const { data } = await api.post<Event>("/api/events", payload)
  return data
}

export async function updateEvent(id: string, payload: Partial<Event>) {
  const { data } = await api.put<Event>(`/api/events/${id}`, payload)
  return data
}

export async function deleteEvent(id: string) {
  const { data } = await api.delete(`/api/events/${id}`)
  return data
}

export async function createClassSlot(payload: {
  title: string
  description?: string
  dateTime: string
  durationMinutes?: number
  maxStudents?: number
}) {
  const { data } = await api.post("/api/class-slots", payload)
  return data
}

export async function updateClassSlot(id: string, payload: Partial<ClassSlot>) {
  const { data } = await api.put<ClassSlot>(`/api/class-slots/${id}`, payload)
  return data
}

export async function deleteClassSlot(id: string) {
  const { data } = await api.delete(`/api/class-slots/${id}`)
  return data
}

export async function getMe() {
  const { data } = await api.get<User>("/api/auth/me")
  return data
}

export async function updateMe(payload: { name?: string; phone?: string; email?: string }) {
  const { data } = await api.put<User>("/api/auth/me", payload)
  return data
}

export async function updatePassword(payload: { oldPassword: string; newPassword: string }) {
  const { data } = await api.put(`/api/auth/updatepassword`, payload)
  return data
}


export function parseApiError(err: any): string {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.message) return err.message
  return "Erro inesperado. Tente novamente."
}

export default api
