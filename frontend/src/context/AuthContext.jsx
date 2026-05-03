import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  // prevents route flicker

  const loadUser = async () => {
    const response = await api.get("/accounts/me/");
    setUser(response.data);
    return response.data;
  };

  //Restore session on app start
  useEffect(() => {

    const fetchUser = async () => {

      const token = localStorage.getItem("access");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await loadUser();

      } catch (error) {

        // token invalid → clean up
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }

      setLoading(false);
    };

    fetchUser();

  }, []);

  // LOGIN
  const login = async (email, password) => {

    const response = await api.post("/accounts/login/", {
      email,
      password,
    });

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    // immediately fetch user
    await loadUser();
  };

  
const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  setUser(null);
};


  const refreshUser = async () => {
    if (!localStorage.getItem("access")) return null;
    return loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
