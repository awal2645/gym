import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));

      authApi.me()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return res.data;
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await authApi.register({ name, email, password, password_confirmation });
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return res.data;
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (token) {
      api
        .post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {});
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
