//Authentication state management
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { IGetAccount } from '@/types/backend';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: IGetAccount['user'] | null;
  setUser: React.Dispatch<React.SetStateAction<IGetAccount['user'] | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IGetAccount['user'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading ban đầu

  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isLoading,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 