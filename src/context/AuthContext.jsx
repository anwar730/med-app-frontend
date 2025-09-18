import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/api";
import { parseJwt } from "../utils/jwt";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // try token first
    const token = localStorage.getItem("token");
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        // payload may include user_id and role
        return { id: payload.user_id, role: payload.role, ...payload };
      }
    }
    // fallback to stored user object (optional)
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // login: store token, derive user from token
  const login = (token, serverUser = null) => {
    localStorage.setItem("token", token);
    if (serverUser) {
      localStorage.setItem("user", JSON.stringify(serverUser));
      setUser(serverUser);
      return;
    }
    const payload = parseJwt(token);
    if (payload) {
      const derived = { id: payload.user_id, role: payload.role, ...payload };
      localStorage.setItem("user", JSON.stringify(derived));
      setUser(derived);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // optional: fresh user from /me
  const refreshUser = async () => {
    try {
      const res = await API.get("/me");
      if (res?.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    // if have token but minimal user info, try to refresh
    if (user && !user.name) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
