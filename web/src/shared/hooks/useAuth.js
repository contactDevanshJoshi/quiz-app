// shared/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'student' | 'admin' | 'teacher' | 'superadmin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('quiz_user');
    const storedRole = localStorage.getItem('quiz_role');
    if (stored) {
      setUser(JSON.parse(stored));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('quiz_user', JSON.stringify(userData));
    localStorage.setItem('quiz_role', userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('quiz_user');
    localStorage.removeItem('quiz_role');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
