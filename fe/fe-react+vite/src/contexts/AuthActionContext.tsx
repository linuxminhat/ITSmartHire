import React, { createContext, useContext, ReactNode } from 'react';

//Defines the type of value
interface AuthActionContextType {
  handleLogin: (username: string, password: string) => Promise<any>;
  handleLogout: () => Promise<void>;
}

//create context with undefined start
const AuthActionContext = createContext<AuthActionContextType | undefined>(undefined);

//Incapsulation this
//custom hook
export const useAuthActions = (): AuthActionContextType => {
  //useContext for get value
  const context = useContext(AuthActionContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthActionProvider');
  }
  return context;
};

interface AuthActionProviderProps {
  children: ReactNode;
  loginAction: (username: string, password: string) => Promise<any>;
  logoutAction: () => Promise<void>;
}

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