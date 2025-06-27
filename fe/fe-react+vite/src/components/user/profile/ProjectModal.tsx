import React, { useState, useEffect, KeyboardEvent } from 'react';
import { XMarkIcon, TagIcon, CalendarIcon, LinkIcon } from '@heroicons/react/24/solid';
import { IProjectPayload, IProject } from '@/types/backend';
import { formatDateForInput, parseDateFromInput } from '@/utils/dateUtils';

interface ProjectModalProps {
  visible: boolean;
  initialData?: IProject | null;
  onCancel: () => void;
  onOk: (payload: IProjectPayload | Partial<IProjectPayload>) => Promise<void>;
  loading: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ visible, initialData, onCancel, onOk, loading }) => {
  const [formData, setFormData] = useState<Partial<IProjectPayload>>({});
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      if (initialData) {
        // Editing existing project
        setFormData({
          name: initialData.name || '',
          url: initialData.url || '',
          startDate: initialData.startDate ? formatDateForInput(initialData.startDate) : '',
          endDate: initialData.endDate ? formatDateForInput(initialData.endDate) : '',
          description: initialData.description || '',
          // technologiesUsed are handled separately
        });
        setTechnologies(initialData.technologiesUsed || []);
      } else {
        // Adding new project
        setFormData({
          name: '',
          url: '',
          startDate: '',
          endDate: '',
          description: '',
        });
        setTechnologies([]);
      }
      setTechInput('');
      setErrors({});
    }
  }, [visible, initialData]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên dự án không được bỏ trống';
    }
    if (formData.url && !/^(https?:\/\/).*/i.test(formData.url)) {
      newErrors.url = 'URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)';
    }
    if (formData.startDate && formData.endDate) {
      const start = parseDateFromInput(formData.startDate);
      const end = parseDateFromInput(formData.endDate);
      if (start && end && start > end) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }
    // Add more validation as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<IProjectPayload>) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, [name]: '' }));
    }
  };

  // --- Technology Tag Input Logic ---
  const handleTechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTechInput(e.target.value);
    if (errors.technologies) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, technologies: '' }));
    }
  };

  const handleAddTech = () => {
    const newTech = techInput.trim();
    if (newTech && !technologies.includes(newTech)) {
      if (technologies.length >= 15) { // Limit number of techs
        setErrors((prev: { [key: string]: string }) => ({ ...prev, technologies: 'Bạn chỉ có thể thêm tối đa 15 công nghệ.' }));
        return;
      }
      setTechnologies([...technologies, newTech]);
      setTechInput('');
      setErrors((prev: { [key: string]: string }) => ({ ...prev, technologies: '' }));
    } else if (technologies.includes(newTech)) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, technologies: 'Công nghệ này đã được thêm.' }));
    } else if (!newTech) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, technologies: 'Vui lòng nhập tên công nghệ.' }));
    }
  };

  const handleTechKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter(tech => tech !== techToRemove));
    if (errors.technologies) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, technologies: '' }));
    }
  };
  // ---------------------------------

  const handleOk = async () => {
    if (!validate()) return;

    const payload: IProjectPayload | Partial<IProjectPayload> = {
      ...formData,
      startDate: formData.startDate ? parseDateFromInput(formData.startDate) : undefined,
      endDate: formData.endDate ? parseDateFromInput(formData.endDate) : undefined,
      technologiesUsed: technologies,
    };

    // Remove empty optional fields before sending
    Object.keys(payload).forEach(key => {
      const typedKey = key as keyof typeof payload;
      if (payload[typedKey] === '' || payload[typedKey] === undefined || (Array.isArray(payload[typedKey]) && (payload[typedKey] as any[]).length === 0)) {
        // Don't delete 'name' even if empty, validation handles it
        if (typedKey !== 'name') {
          delete payload[typedKey];
        }
      }
    });

    try {
      await onOk(payload);
      // Let the parent component handle success message and closing
    } catch (errorInfo) {
      console.error('Save Project Failed:', errorInfo);
      // Parent should handle error display via toast
    }
  };

  // Handle Escape key to close modal
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onCancel} disabled={loading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-6">{initialData ? 'Chỉnh sửa Dự án' : 'Thêm Dự án Mới'}</h3>

        <form onSubmit={(e) => { e.preventDefault(); handleOk(); }}>
          {/* Project Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên dự án <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              disabled={loading}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
              placeholder="Ví dụ: Website thương mại điện tử XYZ"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Project URL */}
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Link dự án (Nếu có)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url || ''}
                onChange={handleInputChange}
                disabled={loading}
                className={`block w-full rounded-md border-0 py-2 pl-10 pr-3 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${errors.url ? 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500' : 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'} disabled:bg-gray-50`}
                placeholder="http://www.example.com"
              />
            </div>
            {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url}</p>}
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.startDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                  max={formatDateForInput(new Date())} // Cannot start in future
                />
              </div>
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (Hoặc dự kiến)</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.endDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
                  min={formData.startDate || ''} // End date cannot be before start date
                />
              </div>
              {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Technologies Used */}
          <div className="mb-4">
            <label htmlFor="techInput" className="block text-sm font-medium text-gray-700 mb-1">Công nghệ sử dụng</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="techInput"
                value={techInput}
                onChange={handleTechInputChange}
                onKeyDown={handleTechKeyDown}
                disabled={loading}
                placeholder="Nhập công nghệ và nhấn Enter hoặc dấu phẩy"
                className={`flex-grow px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.technologies ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={handleAddTech}
                disabled={loading || !techInput.trim()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thêm
              </button>
            </div>
            {errors.technologies && <p className="mt-1 text-xs text-red-600">{errors.technologies}</p>}

            <div className="mt-3 min-h-[40px] bg-gray-50 p-2 rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Công nghệ đã thêm:</p>
              {technologies.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Chưa có công nghệ nào.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((tech) => (
                    <span key={tech} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        disabled={loading}
                        className="flex-shrink-0 ml-1 p-0.5 text-teal-400 hover:bg-teal-200 hover:text-teal-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        <span className="sr-only">Remove {tech}</span>
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả dự án</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50`}
              placeholder="Mô tả chi tiết về dự án, vai trò của bạn, và các thành tựu đạt được..."
            ></textarea>
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">Hủy</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (initialData ? 'Lưu thay đổi' : 'Thêm Dự án')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal; 