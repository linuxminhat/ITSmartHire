import React, { useState, useEffect, KeyboardEvent } from 'react';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/solid';
import { IUserSkillsUpdatePayload } from '@/services/user.service';

interface SkillsModalProps {
  visible: boolean;
  initialSkills?: string[];
  onCancel: () => void;
  onOk: (payload: IUserSkillsUpdatePayload) => Promise<void>;
  loading: boolean;
}

const SkillsModal: React.FC<SkillsModalProps> = ({ visible, initialSkills, onCancel, onOk, loading }) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSkills(initialSkills || []);
      setInputValue('');
      setError(null);
    }
  }, [visible, initialSkills]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError(null); // Clear error on typing
  };

  const handleAddSkill = () => {
    const newSkill = inputValue.trim();
    if (newSkill && !skills.includes(newSkill)) {
      // Basic check for too many skills (optional)
      if (skills.length >= 20) {
        setError("Bạn chỉ có thể thêm tối đa 20 kỹ năng.");
        return;
      }
      setSkills([...skills, newSkill]);
      setInputValue('');
      setError(null);
    } else if (skills.includes(newSkill)) {
      setError("Kỹ năng này đã được thêm.");
    } else if (!newSkill) {
      setError("Vui lòng nhập tên kỹ năng.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    if (error) setError(null); // Clear error if one was showing
  };

  const handleOk = async () => {
    // Validate if needed (e.g., minimum skills?)
    const payload: IUserSkillsUpdatePayload = { skills: skills };
    try {
      await onOk(payload);
    } catch (errorInfo) {
      console.error('Save Skills Failed:', errorInfo);
    }
  };

  // Handle Escape key
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative transform transition-all duration-300 scale-100">
        <button onClick={onCancel} disabled={loading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Chỉnh sửa kỹ năng</h3>

        <div className="mb-4">
          <label htmlFor="skillInput" className="block text-sm font-medium text-gray-700 mb-1">Thêm kỹ năng</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="skillInput"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ví dụ: React, Node.js, SQL (Nhấn Enter để thêm)"
              className={`flex-grow px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={loading || !inputValue.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div className="mb-6 min-h-[50px] bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Các kỹ năng đã thêm:</p>
          {skills.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Chưa có kỹ năng nào.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={loading}
                    className="flex-shrink-0 ml-1.5 p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <span className="sr-only">Remove {skill}</span>
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Hủy</button>
          <button type="button" onClick={handleOk} disabled={loading} className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {loading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Lưu Kỹ Năng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsModal; 