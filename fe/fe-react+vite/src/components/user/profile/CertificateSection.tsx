import React from 'react';
import { ICertificate } from '@/types/backend';
import { formatDisplayDate } from '@/utils/dateUtils';
import { PencilSquareIcon, TrashIcon, PlusCircleIcon, CalendarDaysIcon, LinkIcon, BuildingLibraryIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { ArrowTopRightOnSquareIcon, SparklesIcon } from '@heroicons/react/20/solid';

interface CertificateSectionProps {
  certificates?: ICertificate[];
  onAdd: () => void;
  onEdit: (certificate: ICertificate) => void;
  onDelete: (certificateId: string) => void;
  isDeletingId?: string | null;
}

const CertificateSection: React.FC<CertificateSectionProps> = ({
  certificates,
  onAdd,
  onEdit,
  onDelete,
  isDeletingId
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Chứng chỉ</h2>
        <button
          onClick={onAdd}
          className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1.5" />
          Thêm Chứng chỉ
        </button>
      </div>

      {/* Certificates List */}
      {(!certificates || certificates.length === 0) ? (
        <p className="text-sm text-gray-400 italic">
          Chưa có chứng chỉ nào được thêm. Bổ sung các chứng chỉ bạn đã đạt được.
        </p>
      ) : (
        <ul className="space-y-6">
          {certificates.map((cert) => (
            <li key={cert._id} className="border-b border-gray-100 pb-5 last:border-b-0 relative group">
              {/* Edit/Delete Buttons */}
              <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(cert)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                  aria-label="Chỉnh sửa chứng chỉ"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => cert._id && onDelete(cert._id)}
                  disabled={isDeletingId === cert._id}
                  className={`p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-wait ${isDeletingId === cert._id ? 'text-red-600' : ''}`}
                  aria-label="Xóa chứng chỉ"
                >
                  {isDeletingId === cert._id ? (
                    <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Certificate Details */}
              <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" />
                {cert.name}
              </h3>

              <div className="text-sm text-gray-500 mb-2 flex items-center">
                <BuildingLibraryIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                Cấp bởi: <strong className="text-gray-600 ml-1">{cert.issuingOrganization}</strong>
              </div>

              {/* Dates */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1 mb-2">
                {(cert.issueDate || cert.expirationDate) && (
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                    <span>
                      {cert.issueDate && `Cấp ngày: ${formatDisplayDate(cert.issueDate)}`}
                      {cert.issueDate && cert.expirationDate && ' - '}
                      {cert.expirationDate && `Hết hạn: ${formatDisplayDate(cert.expirationDate)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Credentials */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
                {cert.credentialId && (
                  <div className="flex items-center">
                    <IdentificationIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                    <span>Mã: {cert.credentialId}</span>
                  </div>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <LinkIcon className="h-4 w-4 mr-1.5" />
                    Xem chứng chỉ
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CertificateSection; 