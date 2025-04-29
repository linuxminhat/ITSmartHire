import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, TrophyIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { IAwardPayload, IAward } from '@/types/backend';
import { formatDateForInput, parseDateFromInput } from '@/utils/dateUtils';

interface AwardModalProps {
  visible: boolean;
  initialData?: IAward | null;
  onCancel: () => void;
  onOk: (payload: IAwardPayload | Partial<IAwardPayload>) => Promise<void>;
  loading: boolean;
}

const AwardModal: React.FC<AwardModalProps> = ({ visible, initialData, onCancel, onOk, loading }) => {
  const [formData, setFormData] = useState<Partial<IAwardPayload>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          issuer: initialData.issuer || '',
          issueDate: initialData.issueDate ? formatDateForInput(initialData.issueDate) : '',
          description: initialData.description || '',
        });
      } else {
        setFormData({
          title: '',
          issuer: '',
          issueDate: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [visible, initialData]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'Tên giải thưởng không được bỏ trống';
    }
    // Add other validations if needed (e.g., date logic)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<IAwardPayload>) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOk = async () => {
    if (!validate()) return;

    const payload: IAwardPayload | Partial<IAwardPayload> = {
      ...formData,
      issueDate: formData.issueDate ? parseDateFromInput(formData.issueDate) : undefined,
    };

    Object.keys(payload).forEach(key => {
      const typedKey = key as keyof typeof payload;
      if (payload[typedKey] === '' || payload[typedKey] === undefined) {
          if (typedKey !== 'title') { // Keep title even if empty for validation
             delete payload[typedKey];
          }
      }
    });

    try {
      await onOk(payload);
    } catch (errorInfo) {
      console.error('Save Award Failed:', errorInfo);
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

        <h3 className="text-xl font-semibold text-gray-800 mb-6">{initialData ? 'Chỉnh sửa Giải thưởng' : 'Thêm Giải thưởng Mới'}</h3>

        <form onSubmit={(e) => { e.preventDefault(); handleOk(); }}>
            {/* Award Title */}
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tên giải thưởng/Thành tích <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                    placeholder="Ví dụ: Giải nhất cuộc thi Hackathon ABC"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Issuer */}
            <div className="mb-4">
                <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-1">Đơn vị/Cuộc thi trao giải (Nếu có)</label>
                 <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="issuer"
                        name="issuer"
                        value={formData.issuer || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50`}
                        placeholder="Ví dụ: Thành phố XYZ, Google Code Jam"
                    />
                </div>
            </div>

            {/* Issue Date */}
            <div className="mb-4">
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày nhận giải (Nếu có)</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="date"
                        id="issueDate"
                        name="issueDate"
                        value={formData.issueDate || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.issueDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                        max={formatDateForInput(new Date())} // Award date cannot be in the future
                    />
                 </div>
                 {errors.issueDate && <p className="mt-1 text-xs text-red-600">{errors.issueDate}</p>}
            </div>

            {/* Description */}
            <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Nếu có)</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50`}
                    placeholder="Mô tả thêm về giải thưởng hoặc thành tích này..."
                ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (initialData ? 'Lưu thay đổi' : 'Thêm Giải thưởng')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AwardModal; 