import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { ISkill } from '@/types/backend';
import { callCreateSkill, callUpdateSkill } from '@/services/skill.service';
import { toast } from 'react-toastify';
import { XMarkIcon, InfoIcon } from '@heroicons/react/24/outline';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataInit: ISkill | null;
  refetch: () => void;
}

const inputFieldClass =
  'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100';

const MAX_DESC = 255;

const SkillModal: React.FC<SkillModalProps> = ({ isOpen, onClose, dataInit, refetch }) => {
  const categories = [
    'JavaProgramming',
    'NETProgramming',
    'PythonProgramming',
    'JavaScriptProgramming',
    'C/C++Programming',
    'WebProgramming',
    'MobileProgramming',
    'FunctionalProgramming',
    'ScriptingLanguages',
    'SQLDatabases',
    'NoSQLDatabases',
    'NewSQLDatabases',
    'DataWarehousing',
    'GraphDatabases',
    'Front-endFrameworks',
    'BackendFrameworks',
    'APIDevelopment',
    'MLFrameworks',
    'DevOps',
    "Others"
  ];

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDesc] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  /* -------------------------- INIT / RESET -------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    if (dataInit) {
      setName(dataInit.name || '');
      setCategory(dataInit.category);
      setDesc(dataInit.description || '');
      setIsActive(dataInit.isActive);
    } else {
      setName('');
      setCategory(categories[0]);
      setDesc('');
      setIsActive(true);
    }
    setNameError('');

    // focus first field
    setTimeout(() => nameInputRef.current?.focus(), 10);
  }, [dataInit, isOpen]);

  /* ------------------------- ESC & TAB CYCLE ------------------------ */
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent | KeyboardEvent & { key: string }) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab' && modalRef.current) {
        // focus trap
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          // shift + tab
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // tab forward
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey as any);
    return () => document.removeEventListener('keydown', handleKey as any);
  }, [isOpen]);

  /* ----------------------------- SUBMIT ----------------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Không được để trống');
      nameInputRef.current?.focus();
      return;
    }
    setNameError('');
    setIsLoading(true);

    const payload: Partial<ISkill> = { name: name.trim(), category, description, isActive };
    try {
      if (dataInit?._id) {
        const res = await callUpdateSkill(dataInit._id, payload);
        res ? toast.success(res.message || 'Cập nhật kỹ năng thành công!') : toast.error('Có lỗi xảy ra.');
      } else {
        const res = await callCreateSkill(payload);
        res ? toast.success(res.message || 'Thêm mới kỹ năng thành công!') : toast.error('Có lỗi xảy ra.');
      }
      refetch();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------- RENDER UI --------------------------- */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md sm:max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {dataInit?._id ? 'Cập nhật Kỹ năng' : 'Thêm mới Kỹ năng'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* NAME */}
          <div className="space-y-1">
            <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700">
              Tên Kỹ năng<span className="text-red-600 ml-0.5">*</span>
            </label>
            <input
              id="skill-name"
              type="text"
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={`${inputFieldClass} ${nameError ? 'border-red-500' : ''}`}
              placeholder="Nhập tên kỹ năng…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).form?.requestSubmit();
                }
              }}
            />
            {nameError && <p className="text-xs text-red-600">{nameError}</p>}
          </div>

          {/* CATEGORY */}
          <div className="space-y-1 mt-4">
            <label htmlFor="skill-category" className="block text-sm font-medium text-gray-700">
              Bộ kỹ năng
            </label>
            <select
              id="skill-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputFieldClass}
              disabled={isLoading}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1 mt-4">
            <label htmlFor="skill-desc" className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              id="skill-desc"
              rows={3}
              maxLength={MAX_DESC}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className={inputFieldClass}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tối đa {MAX_DESC} ký tự</span>
              <span>{description.length}/{MAX_DESC}</span>
            </div>
          </div>

          {/* ACTIVE TOGGLE */}
          <div className="mt-4">
            <label className="inline-flex items-center group cursor-pointer" title="Bỏ chọn để lưu ở trạng thái nháp / ẩn">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-indigo-600"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm">Kích hoạt</span>
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 pt-4 border-t mt-4 sm:flex-row sm:justify-end sm:space-x-3 sm:gap-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isLoading ? 'Đang xử lý…' : dataInit?._id ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
