import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const STORAGE_KEY = "redoxy-erp-session";

const AuthContext = createContext({
  token: "",
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(STORAGE_KEY);
    if (!savedToken) {
      setBootstrapped(true);
      return;
    }

    apiRequest("/api/auth/me", { token: savedToken })
      .then((data) => {
        setToken(savedToken);
        setUser(data.user);
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => {
        setBootstrapped(true);
      });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      bootstrapped,
      login: async (email, password) => {
        const data = await apiRequest("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setToken(data.token);
        setUser(data.user);
        window.localStorage.setItem(STORAGE_KEY, data.token);
      },
      logout: () => {
        setToken("");
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [bootstrapped, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
