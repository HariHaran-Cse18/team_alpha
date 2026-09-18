import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('medora_token');
        if (token) {
          const profile = await api.getProfile();
          setUser(profile);
        } else {
          // Pre-authenticate with demo user for seamless hackathon presentation
          const res = await api.demoLogin();
          localStorage.setItem('medora_token', res.access_token);
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Auth init failed, using default demo session', err);
        setUser({
          id: 1,
          full_name: "Dr. Alistair Vance",
          email: "admin@medora.ai",
          role: "Chief Supply Chain Officer",
          hospital_name: "Apollo Metropolitan Academic Hospital"
        });
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('medora_token', res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('medora_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
