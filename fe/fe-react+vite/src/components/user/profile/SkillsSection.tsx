import React from 'react';
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface SkillsSectionProps {
  skills?: string[];
  onEdit: () => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onEdit }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
      {/* Edit Button */}
      <button 
        onClick={onEdit}
        className="absolute top-4 right-4 p-1 text-gray-500 hover:text-indigo-600"
        aria-label="Chỉnh sửa Kỹ năng"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-3">Kỹ năng</h2>
      
      {(!skills || skills.length === 0) ? (
        <p className="text-sm text-gray-400 italic">
          Chưa có kỹ năng nào. Nhấp vào nút chỉnh sửa để thêm.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span 
              key={skill} 
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsSection; 