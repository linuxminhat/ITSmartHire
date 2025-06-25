import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { callFetchCompanyPublic } from '@/services/company.service';
import { ICompany } from '@/types/backend';
import Spinner from '@/components/Spinner';
import { MapPinIcon, BuildingOffice2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';
import companiesBanner from '@/assets/images/companies-banner.jpg';
import { toast } from "react-toastify";

interface IPagination {
  current: number;
  pageSize: number;
  pages: number;
  total: number;
}

const AllCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPagination>({ current: 1, pageSize: 9, pages: 0, total: 0 });

  useEffect(() => {
    const fetchCompanies = async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const query = `current=${page}&pageSize=${meta.pageSize}&sort=-updatedAt`;
        const res = await callFetchCompanyPublic(query);
        if (res && res.data) {
          setCompanies(res.data.result);
          setMeta(res.data.meta);
        } else {
          setError("Không thể tải danh sách công ty.");
        }
      } catch (err: any) {
        let errorMessage = "Đã có lỗi xảy ra khi tải danh sách công ty.";
         if (err?.response?.data?.message) {
             errorMessage = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
         } else if (err.message) {
             errorMessage = err.message;
         }
         setError(errorMessage);
         console.error("Fetch All Companies Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies(meta.current);
  }, [meta.current, meta.pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.pages) {
      setMeta(prevMeta => ({ ...prevMeta, current: newPage }));
    }
  };

  const renderPagination = () => {
    if (meta.pages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, meta.current - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(meta.pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="flex items-center justify-center mt-12" aria-label="Pagination">
         <button
           onClick={() => handlePageChange(meta.current - 1)}
           disabled={meta.current === 1}
           className="relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           Trước
         </button>
         {startPage > 1 && (
            <button onClick={() => handlePageChange(1)} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20">1</button>
         )}
          {startPage > 2 && (
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
          )}
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              aria-current={meta.current === number ? 'page' : undefined}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${meta.current === number ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'}`}
            >
              {number}
            </button>
          ))}
          {endPage < meta.pages -1 && (
             <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
          )}
         {endPage < meta.pages && (
             <button onClick={() => handlePageChange(meta.pages)} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20">{meta.pages}</button>
         )}
         <button
           onClick={() => handlePageChange(meta.current + 1)}
           disabled={meta.current === meta.pages || meta.pages === 0}
           className="relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           Sau
         </button>
      </nav>
    );
  };

  return (
    <div className="bg-gray-50 pb-12">
      <section 
        className="relative h-[200px] text-white py-8 px-4 text-center shadow-md overflow-hidden mb-12"
      >
        <img 
          src={companiesBanner} 
          alt="Companies Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative container mx-auto max-w-4xl z-10">
            <h1 className="text-4xl font-bold mb-3">Khám phá Các Công ty IT Hàng đầu</h1>
            <p className="text-lg text-white">Tìm hiểu về văn hóa, phúc lợi và cơ hội việc làm tại các công ty IT nổi bật.</p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4">
         <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {isLoading && (
               <div className="text-center py-10"><Spinner /></div>
            )}

            {!isLoading && error && (
                <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md"><p>Lỗi: {error}</p></div>
            )}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map(company => (
                    <div key={company._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          <img src={company.logo} alt={`${company.name} logo`} className="h-14 w-14 object-contain mr-4 flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate" title={company.name}>{company.name}</h3>
                            <p className="text-sm text-gray-500 truncate" title={company.industry || 'Ngành nghề không xác định'}>{company.industry || 'Ngành nghề không xác định'}</p>
                          </div>
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-gray-700 mb-4 h-20 overflow-hidden [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: company.description || '<p>Không có mô tả.</p>' }}
                        />
                      </div>
                      <div className="border-t border-gray-100 mt-auto p-5">
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{company.address}</span>
                        </div>
                        <Link
                          to={`/company/${company._id}`}
                          className="block w-full text-center bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default AllCompaniesPage; 