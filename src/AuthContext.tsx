import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from './supabase-client';
interface User {
  id: string;
  nombre: string;
  dni: string;
  type: number;
  // Agrega más campos según tu modelo
}

interface AuthContextType {
  user: User | null;
  login: (dni: string, password: string) => Promise<{ error?: { message: string } }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === Funciones con expiración ===
const setItemWithExpiry = (key: string, value: any, ttl: number) => {
  const now = new Date().getTime();
  const item = {
    value,
    expiry: now + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getItemWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (new Date().getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getItemWithExpiry('user');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (dni: string, password: string) => {
    // Aquí va tu lógica de login con Supabase
    const { data, error } = await supabase.from('users').select('*').eq('dni', dni).single();

    if (error || !data) {
      return { error: { message: 'Usuario no encontrado' } };
    }

    if (data.dni !== password) {
      return { error: { message: 'Contraseña incorrecta' } };
    }

    setUser(data);
    setItemWithExpiry('user', data, 30 * 60 * 1000); // 30 minutos

    return { error: undefined };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
