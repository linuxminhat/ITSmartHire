import React from 'react';
import { IProject } from '@/types/backend';
import { formatDisplayDate } from '@/utils/dateUtils';
import { PencilSquareIcon, TrashIcon, PlusCircleIcon, GlobeAltIcon, TagIcon, CalendarDaysIcon, LinkIcon } from '@heroicons/react/24/outline';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'; // For external link icon

interface ProjectSectionProps {
  projects?: IProject[];
  onAdd: () => void;
  onEdit: (project: IProject) => void;
  onDelete: (projectId: string) => void;
  isDeletingId?: string | null; // To show loading on the specific delete button
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ 
    projects, 
    onAdd, 
    onEdit, 
    onDelete,
    isDeletingId
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Dự án nổi bật</h2>
        <button 
          onClick={onAdd}
          className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1.5" />
          Thêm Dự án
        </button>
      </div>

      {/* Projects List */}
      {(!projects || projects.length === 0) ? (
        <p className="text-sm text-gray-400 italic">
          Chưa có dự án nào được thêm. Hãy giới thiệu những dự án bạn đã tham gia.
        </p>
      ) : (
        <ul className="space-y-6">
          {projects.map((project) => (
            <li key={project._id} className="border-b border-gray-100 pb-5 last:border-b-0 relative group">
              {/* Edit/Delete Buttons - Visible on hover */}
              <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => onEdit(project)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                  aria-label="Chỉnh sửa dự án"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => project._id && onDelete(project._id)}
                  disabled={isDeletingId === project._id}
                  className={`p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-wait ${isDeletingId === project._id ? 'text-red-600' : ''}`}
                  aria-label="Xóa dự án"
                >
                  {isDeletingId === project._id ? (
                     <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  ) : (
                     <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Project Details */}
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.name}</h3>

              {/* Date Range and URL */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1 mb-2">
                 {(project.startDate || project.endDate) && (
                    <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>
                            {project.startDate ? formatDisplayDate(project.startDate) : '...'} -
                            {project.endDate ? formatDisplayDate(project.endDate) : ' Hiện tại'}
                        </span>
                    </div>
                 )}
                 {project.url && (
                    <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                        <LinkIcon className="h-4 w-4 mr-1.5" />
                        Link dự án
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                    </a>
                 )}
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{project.description}</p>
              )}

              {/* Technologies Used */}
              {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                 <div className="flex items-center text-sm text-gray-500 mb-2">
                    <TagIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-2">Công nghệ:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {project.technologiesUsed.map((tech) => (
                        <span 
                            key={tech} 
                            className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-medium rounded-full"
                        >
                            {tech}
                        </span>
                        ))}
                    </div>
                 </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectSection; 