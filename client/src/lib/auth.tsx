import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: number;
  username: string;
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session (mock)
  useEffect(() => {
    const storedUser = localStorage.getItem("mock_replit_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockUser = {
        id: 1,
        username: "replit_user",
        profileImage: "https://ui-avatars.com/api/?name=Replit+User&background=0D8ABC&color=fff",
      };
      setUser(mockUser);
      localStorage.setItem("mock_replit_user", JSON.stringify(mockUser));
      setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_replit_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
