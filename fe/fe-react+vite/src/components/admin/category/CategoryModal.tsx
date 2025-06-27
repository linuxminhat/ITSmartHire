import React, { useState, useEffect } from 'react';
import { ICategory, ISkill } from '@/types/backend';
import {
  callCreateCategory,
  callUpdateCategory,
} from '@/services/category.service';
import { callFetchSkill } from '@/services/skill.service';            // 🆕
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataInit: ICategory | null;
  refetch: () => void;
}

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100';

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  dataInit,
  refetch,
}) => {

  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await callFetchSkill(
          'current=1&pageSize=1000&isActive=true',
        );
        if (res?.data?.result) setSkills(res.data.result);
      } catch {
        toast.error('Không load được danh sách kỹ năng');
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (dataInit) {
      setName(dataInit.name || '');
      setDesc(dataInit.description || '');
      setIsActive(dataInit.isActive ?? true);
      setSelectedSkills(
        (dataInit as any).skills?.map((s: any) =>
          typeof s === 'string' ? s : s._id,
        ) || [],
      );
    } else {
      setName('');
      setDesc('');
      setIsActive(true);
      setSelectedSkills([]);
    }
  }, [dataInit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên danh mục là bắt buộc');
      return;
    }
    setIsLoading(true);
    const payload: Partial<ICategory> = {
      name: name.trim(),
      description,
      isActive,
      skills: selectedSkills, // 🆕
    } as any;

    try {
      if (dataInit?._id) {
        await callUpdateCategory(dataInit._id, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await callCreateCategory(payload);
        toast.success('Thêm mới danh mục thành công');
      }
      refetch();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Đã có lỗi xảy ra',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl
              w-full sm:max-w-2xl            
+             max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {dataInit ? 'Cập nhật Danh mục' : 'Thêm mới Danh mục'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* tên */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên Danh mục *
            </label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* mô tả */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mô tả <span className="text-xs text-gray-500">(tối đa 255)</span>
            </label>
            <textarea
              rows={3}
              maxLength={255}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={inputCls}
            />
            <p className="text-right text-xs text-gray-400">
              {description.length}/255
            </p>
          </div>

          {/* skills multi select */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Bộ kỹ năng
            </label>
            <select
              multiple
              value={selectedSkills}
              onChange={(e) =>
                setSelectedSkills(
                  Array.from(e.target.selectedOptions, (o) => o.value),
                )
              }
              className={`${inputCls} h-60`}
            >
              {skills.map((sk) => (
                <option key={sk._id} value={sk._id}>
                  {sk.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Giữ <kbd className="px-1 border rounded">Ctrl/Cmd</kbd> để chọn
              nhiều
            </p>
          </div>

          {/* trạng thái */}
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="ml-2 text-sm">
              Kích hoạt
              <span className="ml-1 text-gray-400" title="Bỏ chọn để lưu ở trạng thái nháp / ẩn">
                ⓘ
              </span>
            </span>
          </label>

          {/* buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 004 12h4z"
                  ></path>
                </svg>
              )}
              {dataInit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
