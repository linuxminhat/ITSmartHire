import React, { useState, useEffect } from 'react';
import { IExperience } from '@/types/backend';
import { IExperiencePayload } from '@/services/user.service';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ExperienceModalProps {
  visible: boolean;
  initialData?: IExperience | null;
  onCancel: () => void;
  onOk: (values: IExperiencePayload | Partial<IExperiencePayload>) => Promise<void>;
  loading: boolean;
}

const formatDateForInput = (date: string | Date | undefined): string => {
  if (!date) return '';
  try {
    if (typeof date === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
      return date;
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return '';
  }
};

const ExperienceModal: React.FC<ExperienceModalProps> = ({ visible, initialData, onCancel, onOk, loading }) => {
  // State for form fields
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!initialData?._id;

  // Effect to populate form when modal opens or initialData changes
  useEffect(() => {
    if (visible) {
      setCompanyName(initialData?.companyName || '');
      setJobTitle(initialData?.jobTitle || '');
      setLocation(initialData?.location || '');
      setStartDate(formatDateForInput(initialData?.startDate));
      setEndDate(formatDateForInput(initialData?.endDate));
      setDescription(initialData?.description || '');
      setErrors({}); // Reset errors
    }
  }, [visible, initialData]);

  // Basic validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!companyName.trim()) newErrors.companyName = 'Tên công ty không được bỏ trống';
    if (!jobTitle.trim()) newErrors.jobTitle = 'Chức danh không được bỏ trống';
    if (!startDate) newErrors.startDate = 'Ngày bắt đầu không được bỏ trống';
    // Add date comparison validation if needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle OK button click
  const handleOk = async () => {
    if (!validateForm()) return;

    const payload: IExperiencePayload | Partial<IExperiencePayload> = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      location: location.trim() || undefined,
      startDate: startDate,
      endDate: endDate || undefined,
      description: description.trim() || undefined,
    };

    try {
      await onOk(payload);
    } catch (errorInfo) {
      console.error('Save Experience Failed:', errorInfo);
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    if (visible) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onCancel]);

  if (!visible) return null;

  // JSX Structure (Similar to EducationModal, adapt labels/placeholders)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative transform transition-all duration-300 scale-100">
        <button onClick={onCancel} disabled={loading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-6">{isEditing ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm'}</h3>

        <div className="space-y-4">
          {/* Company & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Công ty <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.companyName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Chức danh <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={loading}
                placeholder="Ví dụ: Lập trình viên Frontend, Trưởng nhóm..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.jobTitle ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {errors.jobTitle && <p className="mt-1 text-xs text-red-600">{errors.jobTitle}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              placeholder="Ví dụ: TP. Hồ Chí Minh, Remote..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDateExp" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="startDateExp"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.startDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}\
            </div>
            <div>
              <label htmlFor="endDateExp" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (Để trống nếu đang làm)</label>
              <input
                type="date"
                id="endDateExp"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="descriptionExp" className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
            <textarea
              id="descriptionExp"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Mô tả trách nhiệm, thành tựu đạt được trong công việc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Hủy</button>
          <button type="button" onClick={handleOk} disabled={loading} className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {loading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal; 