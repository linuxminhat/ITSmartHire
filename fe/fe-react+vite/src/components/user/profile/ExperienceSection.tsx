import React from 'react';
import { IExperience } from '@/types/backend';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, CalendarDaysIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

interface ExperienceSectionProps {
  experience?: IExperience[];
  onAdd: () => void;
  onEdit: (exp: IExperience) => void;
  onDelete: (expId: string) => void;
  isDeletingId: string | null; 
}

// Re-use or adapt date formatter
const formatDateForDisplay = (date: string | Date | undefined): string => {
    if (!date) return 'Hiện tại'; 
    try {
        const d = new Date(date);
        const month = d.toLocaleString('vi-VN', { month: 'numeric' }); 
        const year = d.getFullYear();
        if (isNaN(d.getTime())) return 'Ngày không hợp lệ'; 
        return `Tháng ${month}, ${year}`;
    } catch (e) {
        console.error("Error formatting display date:", e);
        return 'Ngày không hợp lệ'; 
    }
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience, onAdd, onEdit, onDelete, isDeletingId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Kinh nghiệm làm việc</h2>
        <button onClick={onAdd} className="p-1 text-indigo-600 hover:text-indigo-800">
          <PlusCircleIcon className="h-6 w-6" />
        </button>
      </div>

      {(!experience || experience.length === 0) ? (
        <p className="text-sm text-gray-400 italic">Chưa có thông tin kinh nghiệm. Nhấp vào nút dấu cộng để thêm.</p>
      ) : (
        <div className="space-y-5">
          {experience.map((exp) => (
            exp._id ? (
              <div key={exp._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-md">{exp.jobTitle}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <BuildingOffice2Icon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                      {exp.companyName}{exp.location ? `, ${exp.location}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <CalendarDaysIcon className="h-3.5 w-3.5 mr-1 text-gray-400"/> 
                      {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => onEdit(exp)} className="p-1 text-gray-400 hover:text-indigo-600">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => exp._id && onDelete(exp._id)}
                      disabled={isDeletingId === exp._id} 
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                     {isDeletingId === exp._id ? (
                          <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                         <TrashIcon className="h-5 w-5" /> 
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : null 
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceSection; 