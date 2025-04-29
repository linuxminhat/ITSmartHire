import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, DevicePhoneMobileIcon, CakeIcon, MapPinIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { IUser, IUserProfileUpdatePayload } from '@/types/backend';

interface BasicInfoModalProps {
  visible: boolean;
  initialData: Partial<Pick<IUser, 'name' | 'phone' | 'age' | 'gender' | 'address'>> | null;
  onCancel: () => void;
  onOk: (payload: IUserProfileUpdatePayload) => Promise<void>;
  loading: boolean;
}

const BasicInfoModal: React.FC<BasicInfoModalProps> = ({ visible, initialData, onCancel, onOk, loading }) => {
  const [formData, setFormData] = useState<Partial<IUserProfileUpdatePayload>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible && initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        age: initialData.age || undefined, // Keep as number or undefined
        gender: initialData.gender || '',
        address: initialData.address || '',
      });
      setErrors({});
    } else if (visible) {
        // Reset if no initial data (should not happen often here)
        setFormData({});
        setErrors({});
    }
  }, [visible, initialData]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên không được bỏ trống';
    }
    if (formData.phone && !/^[0-9\s+()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (formData.age !== undefined && (isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 120)) {
        newErrors.age = 'Tuổi không hợp lệ (phải là số từ 1 đến 120)';
    }
    // Add other validations if needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'age' ? (value === '' ? undefined : parseInt(value, 10)) : value;
    
    setFormData((prev: Partial<IUserProfileUpdatePayload>) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOk = async () => {
    if (!validate()) return;

    // Prepare payload, ensure age is a number if provided
    const payload: IUserProfileUpdatePayload = {
        ...formData,
        age: formData.age !== undefined ? Number(formData.age) : undefined,
    };

    // Remove empty optional fields before sending
    Object.keys(payload).forEach(key => {
      const typedKey = key as keyof typeof payload;
      if (payload[typedKey] === '' || payload[typedKey] === undefined || payload[typedKey] === null) {
          if (typedKey !== 'name') { // Don't delete name
              delete payload[typedKey];
          }
      }
    });

    // Also remove unchanged fields compared to initialData?
    // This might be overly complex unless needed

    try {
      await onOk(payload);
    } catch (errorInfo) {
      console.error('Save Basic Info Failed:', errorInfo);
    }
  };

  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    if (visible) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onCancel} disabled={loading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-6">Chỉnh sửa thông tin cơ bản</h3>

        <form onSubmit={(e) => { e.preventDefault(); handleOk(); }}>
            {/* Name */}
            <div className="mb-4">
                <label htmlFor="basic-name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                 <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="basic-name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                        placeholder="Nhập họ tên của bạn"
                    />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="mb-4">
                <label htmlFor="basic-phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="tel" // Use tel for better mobile input
                        id="basic-phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                        placeholder="Nhập số điện thoại"
                    />
                 </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            {/* Age & Gender */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="basic-age" className="block text-sm font-medium text-gray-700 mb-1">Tuổi</label>
                     <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <CakeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="number"
                            id="basic-age"
                            name="age"
                            value={formData.age || ''} // Show empty string if undefined
                            onChange={handleInputChange}
                            disabled={loading}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.age ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                            placeholder="Nhập tuổi"
                            min="1" max="120"
                        />
                    </div>
                    {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
                </div>
                 <div>
                    <label htmlFor="basic-gender" className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                             <CheckBadgeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                         </div>
                         <select
                             id="basic-gender"
                             name="gender"
                             value={formData.gender || ''}
                             onChange={handleInputChange}
                             disabled={loading}
                             className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.gender ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 bg-white`}
                         >
                             <option value="">Chọn giới tính</option>
                             <option value="male">Nam</option>
                             <option value="female">Nữ</option>
                             <option value="other">Khác</option>
                         </select>
                    </div>
                    {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                 </div>
            </div>

            {/* Address */}
            <div className="mb-6">
                <label htmlFor="basic-address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="basic-address"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                        placeholder="Nhập địa chỉ của bạn"
                    />
                </div>
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : ('Lưu thông tin')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default BasicInfoModal; 