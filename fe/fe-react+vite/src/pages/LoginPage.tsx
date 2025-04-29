import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@/contexts/AuthActionContext';
import { toast } from 'react-toastify';

const backgroundImageUrl = 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { handleLogin } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    try {
      await handleLogin(email, password);
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      console.error("Login Page Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-stretch min-h-screen bg-white">
      <div 
        className="relative hidden w-1/2 lg:block bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent opacity-90"></div>
        <div className="relative z-10 flex flex-col justify-center items-start h-full p-12 text-white">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Đăng nhập để truy cập ngay vào hàng ngàn đánh giá và dữ liệu lương thị trường IT
          </h2>
          <ul className="space-y-3 text-lg">
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Xem trước mức lương để có lợi thế khi thoả thuận
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Tìm hiểu về phúc lợi, con người, văn hóa công ty qua đánh giá chân thật
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Dễ dàng ứng tuyển chỉ với một thao tác
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Quản lý hồ sơ và quyền riêng tư của bạn
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:text-left">
            <h1 className="text-3xl font-bold text-gray-800">IT Smart Hire</h1>
            <p className="text-gray-500 mt-1">Đăng nhập vào tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input 
                type="email" 
                placeholder="your.email@example.com"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="password">
                Mật khẩu
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" disabled={isLoading} />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ tôi
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className={`font-medium text-indigo-600 hover:text-indigo-500 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                  Quên mật khẩu?
                </a>
              </div>
            </div>
            <div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-center text-gray-600">
            Chưa có tài khoản? {' '}
            <Link to="/register" className={`font-medium text-indigo-600 hover:text-indigo-500 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 