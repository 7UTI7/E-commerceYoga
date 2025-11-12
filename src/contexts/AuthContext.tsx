import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
// +++ IMPORTAÇÕES ATUALIZADAS +++
import { getMyFavoriteVideos, toggleFavoriteVideo, type Video } from "../lib/api";

type User = { _id: string; name: string; email: string; role: "USER" | "ADMIN" } | null;

// +++ TIPO DE CONTEXTO ATUALIZADO +++
type AuthContextType = {
  user: User;
  token: string | null;
  isAdmin: boolean;
  setSession: (user: User, token: string, remember?: boolean) => void;
  clearSession: () => void;
  // --- NOVAS PROPRIEDADES ---
  favoriteVideoIds: string[]; // Lista de IDs de vídeos favoritos
  toggleFavorite: (videoId: string) => Promise<void>; // Função para favoritar/desfavoritar
  isFavoritesLoading: boolean; // Para saber se estamos a carregar os favoritos
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  // --- NOVOS ESTADOS ---
  const [favoriteVideoIds, setFavoriteVideoIds] = useState<string[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);

  // +++ NOVA FUNÇÃO INTERNA +++
  // Função para buscar os favoritos do utilizador e preencher o estado
  const fetchFavorites = useCallback(async () => {
    setIsFavoritesLoading(true);
    try {
      // Esta função (do api.ts) busca os vídeos favoritos completos
      const favoriteVideos: Video[] = await getMyFavoriteVideos();
      // Nós só precisamos dos IDs para o nosso estado
      const ids = favoriteVideos.map(video => video._id);
      setFavoriteVideoIds(ids);
    } catch (error) {
      // Se falhar (ex: 401 - token expirado), não fazemos nada, a lista fica vazia
      console.error("Falha ao buscar favoritos:", error);
      setFavoriteVideoIds([]); // Limpa em caso de erro
    } finally {
      setIsFavoritesLoading(false);
    }
  }, []); // useCallback para manter a referência da função estável

  // +++ useEffect ATUALIZADO +++
  // (Para também buscar os favoritos no carregamento inicial)
  useEffect(() => {
    const storage = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
    const t = storage.getItem("auth_token");
    const u = storage.getItem("auth_user");

    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { }
      // Se encontrámos um token, tentamos buscar os favoritos
      fetchFavorites();
    } else {
      // Se não há token, não há favoritos para carregar
      setIsFavoritesLoading(false);
    }
  }, [fetchFavorites]); // Adiciona fetchFavorites como dependência

  // +++ setSession ATUALIZADA +++
  const setSession = (u: User, t: string, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", t);
    storage.setItem("auth_user", JSON.stringify(u));
    setUser(u);
    setToken(t);
    // Quando o utilizador faz login, buscamos os favoritos dele
    fetchFavorites();
  };

  // +++ clearSession ATUALIZADA +++
  const clearSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    setUser(null);
    setToken(null);
    // Quando o utilizador faz logout, limpamos os favoritos
    setFavoriteVideoIds([]);
  };

  // +++ NOVA FUNÇÃO DE CONTEXTO +++
  // Função que os componentes (ex: PostCard) vão chamar
  const toggleFavorite = useCallback(async (videoId: string) => {
    if (!token) {
      // O utilizador não está logado
      // (O ideal seria abrir o modal de login aqui)
      console.warn("Tentativa de favoritar sem estar logado.");
      return;
    }

    // Atualização Otimista (muda a estrela *antes* da resposta da API)
    const isCurrentlyFavorited = favoriteVideoIds.includes(videoId);
    let newFavoritesList: string[];

    if (isCurrentlyFavorited) {
      // Remover da lista
      newFavoritesList = favoriteVideoIds.filter(id => id !== videoId);
    } else {
      // Adicionar à lista
      newFavoritesList = [...favoriteVideoIds, videoId];
    }
    // Atualiza o estado local IMEDIATAMENTE
    setFavoriteVideoIds(newFavoritesList);

    try {
      // Agora, informa o backend
      await toggleFavoriteVideo(videoId);
      // Se a API funcionou, ótimo. O nosso estado já está correto.
    } catch (error) {
      // Se a API falhar, revertemos o estado local para o que era antes
      console.error("Falha ao atualizar favorito no backend:", error);
      // Reverte a atualização otimista (volta ao estado anterior)
      setFavoriteVideoIds(favoriteVideoIds);
      // (Opcional: mostrar um toast de erro ao utilizador)
    }
  }, [favoriteVideoIds, token]); // Depende da lista atual e do token

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  // +++ VALOR DO CONTEXTO ATUALIZADO +++
  const value = {
    user,
    token,
    isAdmin,
    setSession,
    clearSession,
    // --- NOVOS VALORES ---
    favoriteVideoIds,
    toggleFavorite,
    isFavoritesLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}