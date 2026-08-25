import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.");
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Account created successfully! Welcome to PulseCare.`);
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out safely.");
  };

  const setDemoUser = (role: UserRole) => {
    const demoUsers: Record<UserRole, AuthUser> = {
      PATIENT: { id: "p_1", name: "Sinthana K", email: "patient@clinic.com", role: "PATIENT" },
      DOCTOR: { id: "d_1", name: "Dr. Ananya Rao", email: "doctor@clinic.com", role: "DOCTOR" },
      ADMIN: { id: "a_1", name: "System Admin", email: "admin@clinic.com", role: "ADMIN" },
    };
    const demoToken = `demo_jwt_token_${role.toLowerCase()}`;
    const selected = demoUsers[role];
    setUser(selected);
    setToken(demoToken);
    localStorage.setItem("token", demoToken);
    localStorage.setItem("user", JSON.stringify(selected));
    toast.success(`Logged in as Demo ${role}: ${selected.name}`);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setDemoUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
