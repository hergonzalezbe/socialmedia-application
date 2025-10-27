import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react'; // Corregido el import de tipo
import type { UserProfile } from '../types/types'; // Corregido el import de tipo

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, profile: UserProfile) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


const getInitialState = (): { token: string | null; user: UserProfile | null } => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user'); // userJson puede ser 'undefined' o 'null'

  if (token && userJson && userJson !== "undefined") {
    try {

      return { token, user: JSON.parse(userJson) as UserProfile };
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { token: null, user: null };
    }
  }  

  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialState = getInitialState();
  const [token, setToken] = useState<string | null>(initialState.token);
  const [user, setUser] = useState<UserProfile | null>(initialState.user);
  const isAuthenticated = !!token && !!user;

  const login = (newToken: string, profile: UserProfile) => {
    setToken(newToken);
    setUser(profile);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(profile));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
  }, []); 

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};