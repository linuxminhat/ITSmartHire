import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { callRegister } from '@/services/auth.service';

const backgroundImageUrl = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [gender, setGender] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const defaultRoleId = '680125b048ebc6dc41503f15';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword || !age || !gender || !address) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      setIsLoading(false);
      return;
    }
    const parsedAge = parseInt(age as string, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      toast.error('Tuổi không hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      // Pass defaultRoleId to callRegister
      const res = await callRegister(name, email, password, parsedAge, gender, address, defaultRoleId);

      if (res && res.data) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error("Register Page Error:", error);
      toast.error(error.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.');
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
            Tham gia cộng đồng IT Smart Hire ngay hôm nay!
          </h2>
          <ul className="space-y-3 text-lg">
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Nhận thông tin lương IT cập nhật và chính xác
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Chia sẻ đánh giá ẩn danh về công ty bạn đã làm
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Tìm kiếm và ứng tuyển công việc phù hợp
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Xây dựng hồ sơ cá nhân chuyên nghiệp
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:text-left">
            <h1 className="text-3xl font-bold text-gray-800">IT Smart Hire</h1>
            <p className="text-gray-500 mt-1">Tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="name">Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                id="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 disabled:bg-gray-200 ${password !== confirmPassword && confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cyan-500'}`}
              />
              {password !== confirmPassword && confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Mật khẩu xác nhận không khớp.</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="age">Tuổi</label>
              <input type="number" placeholder="Nhập tuổi của bạn" id="age" required value={age} onChange={(e) => setAge(e.target.value)} disabled={isLoading} className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200" />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
              >
                <option value="" disabled>-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="address">Địa chỉ</label>
              <input type="text" placeholder="Nhập địa chỉ của bạn" id="address" required value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200" />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || (password !== confirmPassword && !!confirmPassword)}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản? {' '}
              <Link to="/login" className={`font-medium text-cyan-600 hover:text-cyan-500 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                Đăng nhập
              </Link>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Bạn là nhà tuyển dụng?</span>
              </div>
            </div>

            <Link
              to="/recruiter-register"
              className={`block w-full text-center py-2.5 px-4 border border-cyan-600 text-sm font-medium rounded-lg text-cyan-600 bg-white hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-200 shadow-sm ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Đăng ký dành cho Nhà tuyển dụng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 