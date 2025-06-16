import React from 'react';
import { ICompany } from '@/types/backend';
import { MapPinIcon, BuildingOffice2Icon, CalendarDaysIcon, UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

interface CompanyInfoProps {
  company: ICompany;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ company }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin công ty</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm mb-8">
        {company.companySize && (
          <div className="flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0"/>
            Quy mô: <span className="font-medium ml-1">{company.companySize}</span>
          </div>
        )}
        {company.industry && (
          <div className="flex items-center">
            <BuildingOffice2Icon className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0"/>
            Ngành: <span className="font-medium ml-1">{company.industry}</span>
          </div>
        )}
        {company.country && (
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0"/>
            Quốc gia: <span className="font-medium ml-1">{company.country}</span>
          </div>
        )}
        {company.workingTime && (
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0"/>
            Giờ làm việc: <span className="font-medium ml-1">{company.workingTime}</span>
          </div>
        )}
        {(company.skills && company.skills.length > 0) && (
          <div className="sm:col-span-2 flex items-start mt-2">
            <CheckBadgeIcon className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0 mt-0.5"/>
            <div>
              <span className="font-medium">Kỹ năng chính:</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {company.skills.map(skill => (
                  <span key={typeof skill === 'string' ? skill : skill._id} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                    {typeof skill === 'string' ? skill : skill.name} 
                  </span>
                ))} 
              </div>
            </div>
          </div>
        )} 
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-t pt-6">Giới thiệu công ty</h2>
      <div 
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
        style={{ 
          minHeight: '200px',
          maxHeight: 'none',
          overflowY: 'visible'
        }}
        dangerouslySetInnerHTML={{ 
          __html: company.description || '<p class="italic text-gray-400">Chưa có mô tả.</p>' 
        }} 
      />
    </div>
  );
};

export default CompanyInfo;

