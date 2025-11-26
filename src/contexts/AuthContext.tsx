import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getMyFavoriteVideos, toggleFavoriteVideo, type Video, type User } from "../lib/api";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  setSession: (user: User, token: string, remember?: boolean) => void;
  clearSession: () => void;
  favoriteVideoIds: string[];
  toggleFavorite: (videoId: string) => Promise<void>;
  isFavoritesLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favoriteVideoIds, setFavoriteVideoIds] = useState<string[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setIsFavoritesLoading(true);
    try {
      const favoriteVideos: Video[] = await getMyFavoriteVideos();
      const ids = favoriteVideos.map(video => video._id);
      setFavoriteVideoIds(ids);
    } catch (error) {
      setFavoriteVideoIds([]);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    const storage = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
    const t = storage.getItem("auth_token");
    const u = storage.getItem("auth_user");

    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { }
      fetchFavorites();
    } else {
      setIsFavoritesLoading(false);
    }
  }, [fetchFavorites]);

  // AQUI É ONDE A MÁGICA ACONTECE: Salvamos o usuário (com avatar e role) no storage
  const setSession = (u: User, t: string, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", t);
    storage.setItem("auth_user", JSON.stringify(u));
    setUser(u);
    setToken(t);
    fetchFavorites();
  };

  const clearSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    setUser(null);
    setToken(null);
    setFavoriteVideoIds([]);
  };

  const toggleFavorite = useCallback(async (videoId: string) => {
    if (!token) return;
    const isCurrentlyFavorited = favoriteVideoIds.includes(videoId);
    let newFavoritesList = isCurrentlyFavorited
      ? favoriteVideoIds.filter(id => id !== videoId)
      : [...favoriteVideoIds, videoId];

    setFavoriteVideoIds(newFavoritesList);
    try { await toggleFavoriteVideo(videoId); }
    catch (error) { setFavoriteVideoIds(favoriteVideoIds); }
  }, [favoriteVideoIds, token]);

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, setSession, clearSession, favoriteVideoIds, toggleFavorite, isFavoritesLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}