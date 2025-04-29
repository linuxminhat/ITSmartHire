import React, { useState, useEffect } from 'react';
import { IUser, IRole, ICompany } from '@/types/backend';
import { callCreateUser, callUpdateUser } from '@/services/user.service';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataInit: IUser | null;
  refetch: () => void;
  listRoles: IRole[];
  listCompanies: ICompany[];
}

const inputFieldClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";
const disabledInputFieldClass = `${inputFieldClass} bg-gray-100 cursor-not-allowed`;

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, dataInit, refetch, listRoles, listCompanies }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<string>('');
  const [company, setCompany] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dataInit) {
      setName(dataInit.name || '');
      setEmail(dataInit.email || '');
      setAge(dataInit.age?.toString() || '');
      setGender(dataInit.gender ? (dataInit.gender as 'MALE' | 'FEMALE' | 'OTHER') : 'MALE');
      setAddress(dataInit.address || '');
      setRole(typeof dataInit.role === 'object' ? dataInit.role._id : dataInit.role || '');
      setCompany(typeof dataInit.company === 'object' ? dataInit.company._id : dataInit.company || '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setAge('');
      setGender('MALE');
      setAddress('');
      setRole('');
      setCompany('');
    }
  }, [dataInit, isOpen]);

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as 'MALE' | 'FEMALE' | 'OTHER';
      setGender(value);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !role) {
      toast.error("Tên, Email và Vai trò là bắt buộc.");
      setIsLoading(false);
      return;
    }
    if (!dataInit && !password) {
        toast.error("Mật khẩu là bắt buộc khi tạo người dùng mới.");
        setIsLoading(false);
        return;
    }

    const payload: Partial<IUser> = {
      name,
      email,
      age: age ? parseInt(age) : undefined,
      gender,
      address,
      role: role as any, 
      ...(company && { company: company as any })
    };

    if (!dataInit && password) {
      payload.password = password;
    }

    try {
      if (dataInit?._id) {
        delete payload.email;
        delete payload.password;
        payload.company = company ? company as any : undefined; 

        const res = await callUpdateUser(dataInit._id, payload);
        if (res && res.data) {
          toast.success('Cập nhật người dùng thành công!');
          refetch();
          onClose();
        } else {
          toast.error(res.message || 'Có lỗi xảy ra khi cập nhật.');
        }
      } else {
        payload.company = company ? company as any : undefined;

        const res = await callCreateUser(payload);
        if (res && res.data) {
          toast.success('Thêm mới người dùng thành công!');
          refetch();
          onClose();
        } else {
          toast.error(res.message || 'Có lỗi xảy ra khi thêm mới.');
        }
      }
    } catch (error: any) {
      console.error("Submit User Error:", error);
      toast.error(error?.response?.data?.message || error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {dataInit?._id ? 'Cập nhật Người dùng' : 'Thêm mới Người dùng'}
            </h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <input type="text" id="user-name" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className={inputFieldClass} />
            </div>
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="user-email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || !!dataInit} 
                     className={isLoading || !!dataInit ? disabledInputFieldClass : inputFieldClass} />
            </div>
            {!dataInit && (
              <div>
                <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input type="password" id="user-password" required={!dataInit} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={inputFieldClass} />
              </div>
            )}
            <div>
              <label htmlFor="user-age" className="block text-sm font-medium text-gray-700 mb-1">Tuổi</label>
              <input type="number" id="user-age" value={age} onChange={(e) => setAge(e.target.value)} disabled={isLoading} className={inputFieldClass} />
            </div>
            <div>
              <label htmlFor="user-gender" className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select id="user-gender" value={gender} onChange={handleGenderChange} disabled={isLoading} className={inputFieldClass}>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="user-address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input type="text" id="user-address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} className={inputFieldClass} />
            </div>
            <div>
                 <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                 <select id="user-role" required value={role} onChange={(e) => setRole(e.target.value)} disabled={isLoading} className={inputFieldClass}>
                     <option value="" disabled>-- Chọn vai trò --</option>
                     {listRoles && listRoles.length > 0 && listRoles.map(r => (
                         <option key={r._id} value={r._id}>{r.name}</option>
                     ))}
                 </select>
             </div>
             <div>
                 <label htmlFor="user-company" className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                 <select id="user-company" value={company} onChange={(e) => setCompany(e.target.value)} disabled={isLoading} className={inputFieldClass}>
                     <option value="">-- Chọn công ty --</option>
                     {listCompanies && listCompanies.length > 0 && listCompanies.map(c => (
                         <option key={c._id} value={c._id}>{c.name}</option>
                     ))}
                 </select>
             </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (dataInit?._id ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal; 