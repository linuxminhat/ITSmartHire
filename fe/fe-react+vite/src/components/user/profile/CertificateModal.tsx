import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, LinkIcon, SparklesIcon, IdentificationIcon } from '@heroicons/react/24/solid';
import { ICertificatePayload, ICertificate } from '@/types/backend';
import { formatDateForInput, parseDateFromInput } from '@/utils/dateUtils';

interface CertificateModalProps {
  visible: boolean;
  initialData?: ICertificate | null;
  onCancel: () => void;
  onOk: (payload: ICertificatePayload | Partial<ICertificatePayload>) => Promise<void>;
  loading: boolean;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ visible, initialData, onCancel, onOk, loading }) => {
  const [formData, setFormData] = useState<Partial<ICertificatePayload>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      if (initialData) {
        // Editing existing certificate
        setFormData({
          name: initialData.name || '',
          issuingOrganization: initialData.issuingOrganization || '',
          issueDate: initialData.issueDate ? formatDateForInput(initialData.issueDate) : '',
          expirationDate: initialData.expirationDate ? formatDateForInput(initialData.expirationDate) : '',
          credentialId: initialData.credentialId || '',
          credentialUrl: initialData.credentialUrl || '',
        });
      } else {
        // Adding new certificate
        setFormData({
          name: '',
          issuingOrganization: '',
          issueDate: '',
          expirationDate: '',
          credentialId: '',
          credentialUrl: '',
        });
      }
      setErrors({});
    }
  }, [visible, initialData]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên chứng chỉ không được bỏ trống';
    }
    if (!formData.issuingOrganization?.trim()) {
      newErrors.issuingOrganization = 'Tổ chức cấp không được bỏ trống';
    }
    if (formData.credentialUrl && !/^(https?:\/\/).*/i.test(formData.credentialUrl)) {
        newErrors.credentialUrl = 'URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)';
    }
    if (formData.issueDate && formData.expirationDate) {
      const start = parseDateFromInput(formData.issueDate);
      const end = parseDateFromInput(formData.expirationDate);
      if (start && end && start > end) {
        newErrors.expirationDate = 'Ngày hết hạn phải sau ngày cấp';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<ICertificatePayload>) => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors((prev: { [key: string]: string }) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOk = async () => {
    if (!validate()) return;

    const payload: ICertificatePayload | Partial<ICertificatePayload> = {
        ...formData,
        // Ensure dates are correctly formatted or null/undefined if empty
        issueDate: formData.issueDate ? parseDateFromInput(formData.issueDate) : undefined,
        expirationDate: formData.expirationDate ? parseDateFromInput(formData.expirationDate) : undefined,
    };

    // Remove empty optional fields before sending
    Object.keys(payload).forEach(key => {
         const typedKey = key as keyof typeof payload;
         if (payload[typedKey] === '' || payload[typedKey] === undefined) {
             // Don't delete required fields even if empty, validation handles them
             if (typedKey !== 'name' && typedKey !== 'issuingOrganization') {
                 delete payload[typedKey];
             }
         }
     });

    try {
      await onOk(payload);
    } catch (errorInfo) {
      console.error('Save Certificate Failed:', errorInfo);
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

        <h3 className="text-xl font-semibold text-gray-800 mb-6">{initialData ? 'Chỉnh sửa Chứng chỉ' : 'Thêm Chứng chỉ Mới'}</h3>

        <form onSubmit={(e) => { e.preventDefault(); handleOk(); }}>
            {/* Certificate Name */}
            <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên chứng chỉ <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                    placeholder="Ví dụ: AWS Certified Solutions Architect - Associate"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Issuing Organization */}
            <div className="mb-4">
                <label htmlFor="issuingOrganization" className="block text-sm font-medium text-gray-700 mb-1">Tổ chức cấp <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="issuingOrganization"
                    name="issuingOrganization"
                    value={formData.issuingOrganization || ''}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.issuingOrganization ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                    placeholder="Ví dụ: Amazon Web Services (AWS)"
                />
                {errors.issuingOrganization && <p className="mt-1 text-xs text-red-600">{errors.issuingOrganization}</p>}
            </div>

            {/* Issue & Expiration Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
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
                        />
                    </div>
                    {errors.issueDate && <p className="mt-1 text-xs text-red-600">{errors.issueDate}</p>}
                </div>
                <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn (Nếu có)</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="date"
                            id="expirationDate"
                            name="expirationDate"
                            value={formData.expirationDate || ''}
                            onChange={handleInputChange}
                            disabled={loading}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.expirationDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                            min={formData.issueDate || ''} // Expiration date cannot be before issue date
                        />
                    </div>
                    {errors.expirationDate && <p className="mt-1 text-xs text-red-600">{errors.expirationDate}</p>}
                </div>
            </div>

            {/* Credential ID */}
            <div className="mb-4">
                <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 mb-1">Mã chứng chỉ (Nếu có)</label>
                 <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <IdentificationIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="credentialId"
                        name="credentialId"
                        value={formData.credentialId || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50`}
                        placeholder="ABC-123-XYZ"
                    />
                </div>
                {/* No validation error display for optional field unless needed */}
            </div>

            {/* Credential URL */}
            <div className="mb-6">
                <label htmlFor="credentialUrl" className="block text-sm font-medium text-gray-700 mb-1">Link xác thực (Nếu có)</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="url"
                        id="credentialUrl"
                        name="credentialUrl"
                        value={formData.credentialUrl || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={`block w-full rounded-md border-0 py-2 pl-10 pr-3 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${errors.credentialUrl ? 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500' : 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'} disabled:bg-gray-50`}
                        placeholder="http://www.example.com/certificate/123"
                    />
                </div>
                {errors.credentialUrl && <p className="mt-1 text-xs text-red-600">{errors.credentialUrl}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (initialData ? 'Lưu thay đổi' : 'Thêm Chứng chỉ')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateModal; 