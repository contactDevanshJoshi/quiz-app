// mobile/src/hooks/useAuth.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['quiz_user', 'quiz_role']).then(([[, u], [, r]]) => {
      if (u) { setUser(JSON.parse(u)); setRole(r); }
      setLoading(false);
    });
  }, []);

  const login = async (userData, userRole) => {
    setUser(userData); setRole(userRole);
    await AsyncStorage.multiSet([['quiz_user', JSON.stringify(userData)], ['quiz_role', userRole]]);
  };

  const logout = async () => {
    setUser(null); setRole(null);
    await AsyncStorage.multiRemove(['quiz_user', 'quiz_role']);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
