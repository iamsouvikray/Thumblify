import { createContext, useContext, useEffect, useState } from "react";
import type { IUser } from "../assests/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

interface AuthContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  user: IUser | null;
  setUser: (u: IUser | null) => void;
  login: (u: { email: string; password: string }) => Promise<void>;
  signUp: (u: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 REGISTER
  const signUp = async ({ name, email, password }: any) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password
      });

      setUser(data.user);
      setIsLoggedIn(true);

      toast.success(data.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  };

  // 🔥 LOGIN
  const login = async ({ email, password }: any) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password
      });

      setUser(data.user);
      setIsLoggedIn(true);

      toast.success(data.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      const { data } = await api.post("/api/auth/logout");

      setUser(null);
      setIsLoggedIn(false);

      toast.success(data.message);
    } catch (err: any) {
      toast.error("Logout failed");
    }
  };

  // 🔥 VERIFY SESSION (IMPORTANT FIX)
  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/auth/verify");

      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        login,
        signUp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
