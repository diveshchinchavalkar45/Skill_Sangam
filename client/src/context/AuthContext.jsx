import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillsangam_token'));
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('skillsangam_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        // Also fetch profile completion and preferences
        const profRes = await api.get('/profile/me').catch(() => null);
        setUser(profRes?.data?.profile || res.data.user);
      } else {
        localStorage.removeItem('skillsangam_token');
        setUser(null);
      }
    } catch (err) {
      console.warn('Auth verification failed:', err.message);
      localStorage.removeItem('skillsangam_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('skillsangam_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      localStorage.setItem('skillsangam_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      showToast('Account created successfully! Welcome to SkillSangam.');
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('skillsangam_token');
      setToken(null);
      setUser(null);
      showToast('Logged out successfully', 'info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        showToast,
        isAuthenticated: !!user,
        isOrganizer: user?.user_type === 'organizer',
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-300 translate-y-0 ${
              t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : t.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 text-slate-400 hover:text-slate-700 font-bold focus:outline-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
