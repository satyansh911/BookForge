import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try{
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if(token && userStr){
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch(error){
      console.log("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axiosInstance.post("/api/auth/register", { name, email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
