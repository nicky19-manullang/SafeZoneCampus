import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { UserRoles } from '../types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('safezone_token');
      if (savedToken) {
        try {
          setToken(savedToken);
          const response = await authService.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('safezone_token');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = useCallback(async (nim, password) => {
    setLoading(true);
    try {
      const response = await authService.login(nim, password);
      
      if (response.accessToken) {
        localStorage.setItem('safezone_token', response.accessToken);
        setToken(response.accessToken);
        setUser(response.user);
      }
      
      setLoading(false);
      return response.user;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message 
        ? new Error(error.response.data.message) 
        : new Error('Login gagal');
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.message 
        ? new Error(error.response.data.message) 
        : new Error('Registrasi gagal');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('safezone_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  
  const isAdmin = user?.role === UserRoles.ADMIN;
  const isStudent = user?.role === UserRoles.STUDENT;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isStudent,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
