import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { callRegister } from '@/services/auth.service';

const backgroundImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';

// Hàm chuẩn hóa tên công ty để đối chiếu với email
const normalizeCompanyName = (companyName: string): string => {
    return companyName
        .toLowerCase()
        .replace(/\s+/g, '') // Loại bỏ khoảng trắng
        .normalize("NFD") // Chuyển về dạng không dấu
        .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
        .replace(/[^a-z0-9]/g, ''); // Chỉ giữ lại ký tự và số
};

const HRRegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState<number | string>('');
    const [gender, setGender] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    
    // State cho các thông báo lỗi validation
    const [nameError, setNameError] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [extractedCompany, setExtractedCompany] = useState<string>('');

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const defaultUserRoleId = '680125b048ebc6dc41503f15';
    
    // Hàm kiểm tra cú pháp tên HR và trích xuất tên công ty
    const validateHRName = (value: string): boolean => {
        const hrNameRegex = /^HR công ty\s+(.+)/i; // Bắt đầu bằng "HR công ty" (không phân biệt hoa thường)
        const match = value.match(hrNameRegex);
        
        if (match && match[1]) {
            const companyName = match[1].trim();
            setExtractedCompany(companyName);
            return true;
        } else {
            setExtractedCompany('');
            return false;
        }
    };
    
    // Hàm kiểm tra cú pháp email HR và xem có khớp với tên công ty không
    const validateHREmail = (value: string): boolean => {
        // Kiểm tra cú pháp cơ bản email HR
        const hrEmailRegex = /^hr[a-z0-9_.]+@gmail\.com$/i;
        if (!hrEmailRegex.test(value)) return false;
        
        // Nếu đã có tên công ty, kiểm tra xem email có khớp không
        if (extractedCompany) {
            const normalizedCompany = normalizeCompanyName(extractedCompany);
            // Lấy phần tên email (phần giữa hr và @gmail.com)
            const emailNameMatch = value.match(/^hr([a-z0-9_.]+)@gmail\.com$/i);
            
            if (emailNameMatch) {
                const emailName = emailNameMatch[1].toLowerCase();
                // So sánh chuỗi trong email có chứa tên công ty đã chuẩn hóa không
                const isMatched = emailName.includes(normalizedCompany) || 
                                   normalizedCompany.includes(emailName);
                
                return isMatched;
            }
        }
        
        return true; // Nếu chưa có tên công ty để so sánh, tạm thời coi là hợp lệ
    };
    
    // Cập nhật validation khi tên công ty thay đổi
    useEffect(() => {
        if (extractedCompany && email) {
            // Kiểm tra lại email khi tên công ty thay đổi
            if (!validateHREmail(email)) {
                setEmailError(`Email không khớp với tên công ty "${extractedCompany}". Vui lòng sử dụng email chứa tên công ty (vd: hr${normalizeCompanyName(extractedCompany)}@gmail.com)`);
            } else {
                setEmailError('');
            }
        }
    }, [extractedCompany, email]);
    
    // Xử lý thay đổi tên
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        
        if (value && !validateHRName(value)) {
            setNameError('Tên không đúng cú pháp. Vui lòng sử dụng định dạng "HR công ty [tên công ty]"');
        } else {
            setNameError('');
            // Kiểm tra lại email để đảm bảo phù hợp với tên công ty mới
            if (email) {
                if (!validateHREmail(email)) {
                    setEmailError(`Email không khớp với tên công ty "${extractedCompany}". Vui lòng sử dụng email chứa tên công ty (vd: hr${normalizeCompanyName(extractedCompany)}@gmail.com)`);
                } else {
                    setEmailError('');
                }
            }
        }
    };
    
    // Xử lý thay đổi email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        
        if (!value) {
            setEmailError('');
            return;
        }

        const basicEmailRegex = /^hr[a-z0-9_.]+@gmail\.com$/i;
        if (!basicEmailRegex.test(value)) {
            setEmailError('Email không đúng cú pháp. Vui lòng sử dụng định dạng "hr[tencongtycuaban]@gmail.com"');
            return;
        }
        
        // Nếu đã có tên công ty, kiểm tra xem email có khớp không
        if (extractedCompany && !validateHREmail(value)) {
            setEmailError(`Email không khớp với tên công ty "${extractedCompany}". Vui lòng sử dụng email chứa tên công ty (vd: hr${normalizeCompanyName(extractedCompany)}@gmail.com)`);
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Validate các trường trước khi submit
        if (!validateHRName(name)) {
            toast.error('Tên không đúng cú pháp yêu cầu');
            return;
        }
        
        // Kiểm tra cả cú pháp email và tính tương thích với tên công ty
        if (!validateHREmail(email)) {
            if (extractedCompany) {
                toast.error(`Email không khớp với tên công ty "${extractedCompany}". Vui lòng sử dụng email chứa tên công ty.`);
            } else {
                toast.error('Email không đúng cú pháp yêu cầu');
            }
            return;
        }
        
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
            const res = await callRegister(
                name, 
                email, 
                password, 
                parsedAge, 
                gender, 
                address, 
                defaultUserRoleId
            );

            if (res && res.data) {
                toast.success('Đăng ký tài khoản nhà tuyển dụng thành công! Vui lòng đăng nhập.');
                toast.info(
                    'Để được nâng cấp lên tài khoản HR, vui lòng liên hệ itsmarthire.team@gmail.com kèm thông tin công ty', 
                    { autoClose: 10000 }
                );
                navigate('/login?registered=hr');
            } else {
                toast.error(res.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (error: any) {
            console.error("Register HR Page Error:", error);
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
                        Đăng ký tài khoản nhà tuyển dụng
                    </h2>
                    <ul className="space-y-3 text-lg">
                        <li className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Đăng tuyển dụng và quản lý ứng viên hiệu quả
                        </li>
                        <li className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Tiếp cận nguồn nhân lực IT chất lượng cao
                        </li>
                        <li className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Quản lý công việc và hồ sơ ứng tuyển dễ dàng
                        </li>
                        <li className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Xây dựng thương hiệu nhà tuyển dụng hàng đầu
                        </li>
                    </ul>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-800">IT Smart Hire</h1>
                        <p className="text-gray-500 mt-1">Đăng ký tài khoản nhà tuyển dụng</p>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-6">
                        <h3 className="font-semibold text-blue-800 text-base mb-3">Quy trình đăng ký tài khoản nhà tuyển dụng</h3>
                        
                        <div className="space-y-3">
                            <div className="flex">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-xs font-bold">1</span>
                                </div>
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Đăng ký</span> tài khoản với vai trò người dùng
                                </p>
                            </div>
                            
                            <div className="flex">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-xs font-bold">2</span>
                                </div>
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Gửi email</span> đến <span className="font-semibold">itsmarthire.team@gmail.com</span> với tiêu đề "Đăng ký HR + tên công ty"
                                </p>
                            </div>
                            
                            <div className="flex">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-xs font-bold">3</span>
                                </div>
                                <div className="text-sm text-blue-700">
                                    <span className="font-medium">Cung cấp thông tin:</span>
                                    <ul className="mt-1 pl-1 grid grid-cols-2 gap-x-2 gap-y-1">
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Vai trò
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Tên công ty
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Mã số thuế
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Email công ty
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Họ tên HR
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Số điện thoại
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Địa chỉ
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="name">Họ và tên</label>
                            <input
                                type="text"
                                placeholder="Cú pháp : hr[tên công ty]"
                                id="name"
                                required
                                value={name}
                                onChange={handleNameChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-2.5 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 disabled:bg-gray-200 ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cyan-500'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">Cú pháp : Sử dụng định dạng "HR + tên công ty" (Ví dụ: HR công ty FPT Software)</p>
                            {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                            <input
                                type="email"
                                placeholder="Cú pháp : hr[tencongtycuaban]@gmail.com"
                                id="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-2.5 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 disabled:bg-gray-200 ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cyan-500'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">Cú pháp: Sử dụng định dạng "hr + tên công ty + @gmail.com" (Ví dụ: hr.fptsoft@gmail.com)</p>
                            {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                            {extractedCompany && !emailError && 
                                <p className="text-xs text-green-600 mt-1">
                                    Gợi ý email: hr{normalizeCompanyName(extractedCompany)}@gmail.com
                                </p>
                            }
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
                            <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="address">Địa chỉ công ty</label>
                            <input
                                type="text"
                                placeholder="Nhập địa chỉ chính xác của công ty"
                                id="address"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 disabled:bg-gray-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">Vui lòng nhập chính xác địa chỉ công ty để dễ dàng xác minh</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || (password !== confirmPassword && !!confirmPassword)}
                                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
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
                                <span className="px-2 bg-gray-50 text-gray-500">Bạn là ứng viên?</span>
                            </div>
                        </div>

                        <Link
                            to="/register"
                            className={`block w-full text-center py-2.5 px-4 border border-cyan-600 text-sm font-medium rounded-lg text-cyan-600 bg-white hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-200 shadow-sm ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            Đăng ký dành cho Ứng viên
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRRegisterPage; 