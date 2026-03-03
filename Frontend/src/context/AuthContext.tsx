import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "wealthpulse_token";
const USER_KEY  = "wealthpulse_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ── Restore session from localStorage on mount ── */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser  = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsed);
        setIsAuthenticated(true);

        /* Optionally verify token is still valid */
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
          .then((data: { name: string; email: string }) => {
            const verified: User = { name: data.name, email: data.email };
            setUser(verified);
            localStorage.setItem(USER_KEY, JSON.stringify(verified));
          })
          .catch(() => {
            /* Token expired — clean up */
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          });
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  /* ── Helper: persist auth state ── */
  const persist = (jwt: string, u: User) => {
    setToken(jwt);
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setShowAuthModal(false);
  };

  /* ── LOGIN ── */
  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) {
        return { ok: false, message: data.message || "Invalid email or password" };
      }

      persist(data.token, { name: data.name, email: data.email });
      return { ok: true, message: "Login successful" };
    } catch {
      return { ok: false, message: "Server unreachable. Please try again." };
    }
  }, []);

  /* ── SIGNUP ── */
  const signup = useCallback(async (name: string, email: string, password: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) {
        return { ok: false, message: data.message || "Signup failed" };
      }

      persist(data.token, { name: data.name, email: data.email });
      return { ok: true, message: "Account created!" };
    } catch {
      return { ok: false, message: "Server unreachable. Please try again." };
    }
  }, []);

  /* ── LOGOUT ── */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, signup, logout, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
