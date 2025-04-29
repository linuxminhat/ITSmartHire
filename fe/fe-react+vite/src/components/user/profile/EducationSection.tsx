import React from 'react';
import { IEducation } from '@/types/backend';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface EducationSectionProps {
  education?: IEducation[];
  onAdd: () => void;
  onEdit: (edu: IEducation) => void;
  onDelete: (eduId: string) => void;
  isDeletingId: string | null; // ID of the item currently being deleted (for loading state)
}

// Helper to format date for display
const formatDateForDisplay = (date: string | Date | undefined): string => {
    if (!date) return 'Hiện tại'; // Display 'Present' if no end date
    try {
        const d = new Date(date);
        // Get month and year, adjust month index (0-based)
        const month = d.toLocaleString('vi-VN', { month: 'numeric' }); // Use Vietnamese locale for month
        const year = d.getFullYear();
        // Ensure valid date before formatting
        if (isNaN(d.getTime())) return 'Ngày không hợp lệ'; 
        return `Tháng ${month}, ${year}`;
    } catch (e) {
        console.error("Error formatting display date:", e);
        return 'Ngày không hợp lệ'; 
    }
};

const EducationSection: React.FC<EducationSectionProps> = ({ education, onAdd, onEdit, onDelete, isDeletingId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Học vấn</h2>
        <button onClick={onAdd} className="p-1 text-indigo-600 hover:text-indigo-800">
          <PlusCircleIcon className="h-6 w-6" />
        </button>
      </div>

      {(!education || education.length === 0) ? (
        <p className="text-sm text-gray-400 italic">Chưa có thông tin học vấn. Nhấp vào nút dấu cộng để thêm.</p>
      ) : (
        <div className="space-y-5">
          {education.map((edu) => (
            // Ensure edu._id exists before using it as key and passing to delete
            edu._id ? (
              <div key={edu._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-md">{edu.school}</h3>
                    <p className="text-sm text-gray-600">{edu.degree}{edu.fieldOfStudy ? ` - ${edu.fieldOfStudy}` : ''}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <CalendarDaysIcon className="h-3.5 w-3.5 mr-1 text-gray-400"/> 
                      {formatDateForDisplay(edu.startDate)} - {formatDateForDisplay(edu.endDate)}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">{edu.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => onEdit(edu)} className="p-1 text-gray-400 hover:text-indigo-600">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => edu._id && onDelete(edu._id)}
                      disabled={isDeletingId === edu._id} // Disable button if this item is being deleted
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                     {isDeletingId === edu._id ? (
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
            ) : null // Render nothing if edu._id is missing (should not happen ideally)
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationSection; 