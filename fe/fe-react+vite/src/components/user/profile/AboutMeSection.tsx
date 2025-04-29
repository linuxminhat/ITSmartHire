import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface AboutMeSectionProps {
  aboutMe?: string;
  onEdit: () => void;
}

const AboutMeSection: React.FC<AboutMeSectionProps> = ({ aboutMe, onEdit }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
      {/* Edit Button */}
      <button 
        onClick={onEdit}
        className="absolute top-4 right-4 p-1 text-gray-500 hover:text-indigo-600"
        aria-label="Chỉnh sửa Giới thiệu bản thân"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-3">Giới thiệu bản thân</h2>
      
      {aboutMe ? (
        // Using whitespace-pre-line to preserve line breaks from the textarea
        <p className="text-sm text-gray-600 whitespace-pre-line">{aboutMe}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">
          Chưa có giới thiệu bản thân. Nhấp vào nút chỉnh sửa để thêm.
        </p>
      )}
    </div>
  );
};

export default AboutMeSection; 