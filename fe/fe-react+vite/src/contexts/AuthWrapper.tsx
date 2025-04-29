import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { callFetchAccount, callLogin } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/config/axios-customize'; // Import instance axios đã cấu hình
import { AuthActionProvider } from './AuthActionContext'; // Import Action Provider

// Component này wrap nội dung chính của RouterProvider
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    isAuthenticated, 
    setIsAuthenticated, 
    setUser, 
    setIsLoading 
  } = useAuth();
  const navigate = useNavigate();

  // Logic fetch account ban đầu khi component mount
  useEffect(() => {
    const fetchInitialAccount = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // >>> QUAN TRỌNG: Đảm bảo axios instance đã được cấu hình để gửi token
        // Trong file axios-customize.ts, interceptor request đã làm việc này
        // Nếu không, bạn cần thêm header ở đây:
        // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await callFetchAccount();
          if (res && res.data) {
            setIsAuthenticated(true);
            setUser(res.data.user);
          } else {
            // Token không hợp lệ hoặc hết hạn
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
         // Không có token, đảm bảo trạng thái là chưa đăng nhập
         setIsAuthenticated(false);
         setUser(null);
         delete axiosInstance.defaults.headers.common['Authorization'];
      }
      setIsLoading(false);
    };

    fetchInitialAccount();
  }, [setIsAuthenticated, setIsLoading, setUser]); // Dependencies

  // Các hàm login/logout có thể được định nghĩa ở đây hoặc trong các component cần dùng
  // Ví dụ: Tạo hàm login để component LoginPage có thể gọi
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
            navigate('/admin'); // Navigate ADMIN to /admin
          } else if (roleName === 'HR') {
            navigate('/hr'); // Navigate HR to /hr
          } else {
            navigate('/'); // Navigate other roles (like USER) to homepage
          }
          // ------------------------
          
          return accountRes.data; // Trả về dữ liệu nếu cần
        } else {
          // Clear token and state if fetching account after login fails
          localStorage.removeItem('access_token');
          delete axiosInstance.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
          throw new Error('Failed to fetch account details after login.');
        }
      } else {
         // Use message from API response if available
        throw new Error(res?.message || 'Login failed');
      }
    } catch (error) {
      // Xóa token và reset state nếu login lỗi
      localStorage.removeItem('access_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      console.error("AuthWrapper: Login error:", error);
      throw error; // Ném lỗi ra để component gọi xử lý (vd: hiển thị toast)
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
     setIsLoading(true);
     try {
       // await callLogout(); // Gọi API logout nếu cần
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

  // Wrap children bằng AuthActionProvider và truyền các hàm vào
  return (
    <AuthActionProvider loginAction={handleLogin} logoutAction={handleLogout}>
      {children}
    </AuthActionProvider>
  );
};

export default AuthWrapper; 