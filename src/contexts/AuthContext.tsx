import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { _id: string; name: string; email: string; role: "USER" | "ADMIN" } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  isAdmin: boolean;
  setSession: (user: User, token: string, remember?: boolean) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storage = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
    const t = storage.getItem("auth_token");
    const u = storage.getItem("auth_user");
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch {}
    }
  }, []);

  const setSession = (u: User, t: string, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", t);
    storage.setItem("auth_user", JSON.stringify(u));
    setUser(u);
    setToken(t);
  };

  const clearSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    setUser(null);
    setToken(null);
  };

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  const value = { user, token, isAdmin, setSession, clearSession };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
