import React, { createContext, useContext, ReactNode } from 'react';
import { useAppSelector } from '../store/hooks';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);
  
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated,
        user,
        loading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 