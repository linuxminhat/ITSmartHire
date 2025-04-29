import React, { createContext, useContext, ReactNode } from 'react';

// Định nghĩa kiểu cho các hàm actions
interface AuthActionContextType {
  handleLogin: (username: string, password: string) => Promise<any>; // Kiểu trả về có thể chi tiết hơn
  handleLogout: () => Promise<void>;
}

// Tạo context
const AuthActionContext = createContext<AuthActionContextType | undefined>(undefined);

// Hook để sử dụng context
export const useAuthActions = (): AuthActionContextType => {
  const context = useContext(AuthActionContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthActionProvider');
  }
  return context;
};

// Props cho Provider
interface AuthActionProviderProps {
  children: ReactNode;
  loginAction: (username: string, password: string) => Promise<any>;
  logoutAction: () => Promise<void>;
}

// Provider component
export const AuthActionProvider: React.FC<AuthActionProviderProps> = ({ 
  children, 
  loginAction, 
  logoutAction 
}) => {
  const contextValue = {
    handleLogin: loginAction,
    handleLogout: logoutAction,
  };

  return (
    <AuthActionContext.Provider value={contextValue}>
      {children}
    </AuthActionContext.Provider>
  );
}; 