import React from 'react';
import { IAward } from '@/types/backend';
import { formatDisplayDate } from '@/utils/dateUtils';
import { PencilSquareIcon, TrashIcon, PlusCircleIcon, CalendarDaysIcon, BuildingOfficeIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface AwardSectionProps {
  awards?: IAward[];
  onAdd: () => void;
  onEdit: (award: IAward) => void;
  onDelete: (awardId: string) => void;
  isDeletingId?: string | null;
}

const AwardSection: React.FC<AwardSectionProps> = ({ 
    awards, 
    onAdd, 
    onEdit, 
    onDelete,
    isDeletingId
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Giải thưởng & Thành tích</h2>
        <button 
          onClick={onAdd}
          className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1.5" />
          Thêm Giải thưởng
        </button>
      </div>

      {/* Awards List */}
      {(!awards || awards.length === 0) ? (
        <p className="text-sm text-gray-400 italic">
          Chưa có giải thưởng hoặc thành tích nào được thêm.
        </p>
      ) : (
        <ul className="space-y-6">
          {awards.map((award) => (
            <li key={award._id} className="border-b border-gray-100 pb-5 last:border-b-0 relative group">
               {/* Edit/Delete Buttons */}
              <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => onEdit(award)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                  aria-label="Chỉnh sửa giải thưởng"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => award._id && onDelete(award._id)}
                  disabled={isDeletingId === award._id}
                  className={`p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-wait ${isDeletingId === award._id ? 'text-red-600' : ''}`}
                  aria-label="Xóa giải thưởng"
                >
                  {isDeletingId === award._id ? (
                     <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  ) : (
                     <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Award Details */}
              <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0"/>
                  {award.title}
              </h3>

              {(award.issuer || award.issueDate) && (
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1 mb-2">
                    {award.issuer && (
                        <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0"/>
                            <span>{award.issuer}</span>
                        </div>
                    )}
                    {award.issueDate && (
                        <div className="flex items-center">
                             <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                             <span>{formatDisplayDate(award.issueDate)}</span>
                        </div>
                    )}
                 </div>
              )}

              {/* Description */}
              {award.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{award.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AwardSection; 