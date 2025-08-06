// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import supabase from './../supabase-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cargar usuario desde Supabase o mediante un token almacenado
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);


  const login = async (dni, password) => {
   /* const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setUser(data.user);
    }
    return { data, error };*/
    const { data, error } = await supabase
    .from('users') // o 'usuarios'
    .select('*')
    .eq('dni', dni)
    .single();
    
    if (error || !data) {
      return { data: null, error: { code:1 ,message: 'Usuario no encontrado' } };
    }
    
    if (data.dni !== password) {
      return { data: null, error: { code:2 ,message: 'Contraseña incorrecta' } };
    }

    setUser(data); // Guarda todo el usuario

    return { data, error: null };
  };

  const logout = async () => {
   // await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);
