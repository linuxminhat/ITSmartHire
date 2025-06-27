import React, { useState, useEffect } from 'react';
import { IEducation } from '@/types/backend';
import { IEducationPayload } from '@/services/user.service';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface EducationModalProps {
  visible: boolean;
  initialData?: IEducation | null;
  onCancel: () => void;
  onOk: (values: IEducationPayload | Partial<IEducationPayload>) => Promise<void>;
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

const EducationModal: React.FC<EducationModalProps> = ({ visible, initialData, onCancel, onOk, loading }) => {
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!initialData?._id;

  useEffect(() => {
    if (visible) {
      setSchool(initialData?.school || '');
      setDegree(initialData?.degree || '');
      setFieldOfStudy(initialData?.fieldOfStudy || '');
      setStartDate(formatDateForInput(initialData?.startDate));
      setEndDate(formatDateForInput(initialData?.endDate));
      setDescription(initialData?.description || '');
      setErrors({});
    } else {

    }
  }, [visible, initialData]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!school.trim()) newErrors.school = 'Tên trường không được bỏ trống';
    if (!degree.trim()) newErrors.degree = 'Bằng cấp không được bỏ trống';
    if (!startDate) newErrors.startDate = 'Ngày bắt đầu không được bỏ trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = async () => {
    if (!validateForm()) {
      return;
    }

    const payload: IEducationPayload | Partial<IEducationPayload> = {
      school: school.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim() || undefined,
      startDate: startDate,
      endDate: endDate || undefined,
      description: description.trim() || undefined,
    };

    try {
      await onOk(payload);
    } catch (errorInfo) {
      console.error('Save Education Failed:', errorInfo);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button onClick={onCancel} disabled={loading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-6">{isEditing ? 'Chỉnh sửa học vấn' : 'Thêm học vấn'}</h3>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* School & Degree */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">Trường/Trung tâm <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.school ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {errors.school && <p className="mt-1 text-xs text-red-600">{errors.school}</p>}
            </div>
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Bằng cấp <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                disabled={loading}
                placeholder="Ví dụ: Cử nhân, Kỹ sư, Chứng chỉ..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.degree ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {errors.degree && <p className="mt-1 text-xs text-red-600">{errors.degree}</p>}
            </div>
          </div>

          {/* Field of Study */}
          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
            <input
              type="text"
              id="fieldOfStudy"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              disabled={loading}
              placeholder="Ví dụ: Khoa học máy tính, Công nghệ phần mềm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.startDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (Để trống nếu đang học)</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                min={startDate} // Prevent end date before start date
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Mô tả ngắn gọn về quá trình học, GPA, dự án,... (nếu có)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleOk}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducationModal; 