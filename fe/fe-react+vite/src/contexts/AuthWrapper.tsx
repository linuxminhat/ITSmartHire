import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';//state Auth
import { callFetchAccount, callLogin } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';//hook for navigate
import axiosInstance from '@/config/axios-customize';
import { AuthActionProvider } from './AuthActionContext';

//provide handleLogin and handleLogout
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    setUser,
    setIsLoading
  } = useAuth();
  const navigate = useNavigate();

  //useEffect is a hook allow tasks after the component renders (literally).
  useEffect(() => {
    const fetchInitialAccount = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await callFetchAccount();
          if (res && res.data) {
            //Check if token is valid
            setIsAuthenticated(true);
            setUser(res.data.user);
          } else {
            localStorage.removeItem('access_token');
            delete axiosInstance.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error("AuthWrapper: Error fetching account:", error);
          localStorage.removeItem('access_token');
          delete axiosInstance.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        delete axiosInstance.defaults.headers.common['Authorization'];
      }
      setIsLoading(false);
    };

    fetchInitialAccount();
  }, [setIsAuthenticated, setIsLoading, setUser]);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await callLogin(username, password);
      if (res && res.data) {
        const token = res.data.access_token;
        localStorage.setItem('access_token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch lại account để cập nhật state
        const accountRes = await callFetchAccount();
        if (accountRes && accountRes.data) {
          setIsAuthenticated(true);
          setUser(accountRes.data.user);

          // --- Navigation Logic --- 
          const roleName = accountRes.data.user.role?.name;
          if (roleName === 'ADMIN') {
            navigate('/admin');
          } else if (roleName === 'HR') {
            navigate('/hr');
          } else {
            navigate('/');
          }
          // ------------------------

          return accountRes.data;
        } else {

          localStorage.removeItem('access_token');
          delete axiosInstance.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
          throw new Error('Failed to fetch account details after login.');
        }
      } else {

        throw new Error(res?.message || 'Login failed');
      }
    } catch (error) {

      localStorage.removeItem('access_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      console.error("AuthWrapper: Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
    } catch (error) {
      console.error("AuthWrapper: Logout API call failed:", error);
    } finally {
      localStorage.removeItem('access_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      navigate('/login');
    }
  };
  return (
    <AuthActionProvider loginAction={handleLogin} logoutAction={handleLogout}>
      {children}
    </AuthActionProvider>
  );
};

export default AuthWrapper; 