import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { callFetchCompany } from '@/services/company.service';
import { ICompany } from '@/types/backend';
import Spinner from '@/components/Spinner';
import { MapPinIcon, BuildingOffice2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';
import companiesBanner from '@/assets/images/companies-banner.jpg';
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
        const res = await callFetchCompany(query);
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
                  {companies.length > 0 ? (
                     companies.map((company) => (
                      <Link 
                        key={company._id} 
                        to={`/company/${company._id}`} 
                        className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300 group"
                       >
                          <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50 group-hover:bg-gray-100 transition">
                               <img 
                                   src={company.logo || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Logo'} 
                                   alt={`${company.name} logo`} 
                                   className="h-14 w-14 object-contain mr-4 border rounded-md p-1 bg-white flex-shrink-0"
                               />
                               <span className="font-semibold text-gray-800 flex-grow truncate group-hover:text-indigo-600 transition" title={company.name}>{company.name}</span>
                          </div>
                          
                          <div className="p-4 flex-grow">
                               <div 
                                  className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none" 
                                  dangerouslySetInnerHTML={{ __html: company.description || '<p class="italic text-gray-400">Chưa có mô tả.</p>' }}
                               />
                          </div>
                          
                          <div className="p-4 mt-auto flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 ">
                              <div className="flex items-center space-x-1 truncate">
                                  <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                  <span className="truncate" title={company.address || 'Chưa rõ'}>{company.address || 'Chưa rõ'}</span> 
                              </div>
                              <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-indigo-600 transition" />
                          </div>
                      </Link>
                     ))
                  ) : (
                       <div className="col-span-full text-center text-gray-500 py-16 flex flex-col items-center">
                           <BuildingOffice2Icon className="h-12 w-12 text-gray-400 mb-4" />
                           <p className="text-lg">Không tìm thấy công ty nào phù hợp.</p>
                           <p className="text-sm">Hãy thử lại sau hoặc khám phá các việc làm nổi bật.</p>
                       </div>
                  )}
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