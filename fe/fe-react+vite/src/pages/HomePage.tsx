import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinIcon, MagnifyingGlassIcon, BuildingOffice2Icon, ArrowRightIcon, BriefcaseIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { callFetchCompany } from '@/services/company.service';
import { callFetchJob } from '@/services/job.service';
import { ICompany, IJob } from '@/types/backend';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import axios from 'axios';

// Define interface for province data
interface IProvince {
  name: string;
  code: number;
  // Add other fields if needed based on API response
}

const HomePage: React.FC = () => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);
  const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(true);
  const [errorProvinces, setErrorProvinces] = useState<string | null>(null);

  // State for search inputs
  const [searchName, setSearchName] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      setErrorCompanies(null);
      try {
        const res = await callFetchCompany('current=1&pageSize=3&sort=-updatedAt');
        if (res && res.data) {
          setCompanies(res.data.result);
        } else {
          setErrorCompanies("Không thể tải danh sách công ty.");
        }
      } catch (err: any) {
        setErrorCompanies("Lỗi tải công ty.");
        console.error("Fetch Companies Error:", err);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      setErrorJobs(null);
      try {
        const res = await callFetchJob('current=1&pageSize=6&sort=-updatedAt');
        if (res && res.data) {
          setJobs(res.data.result);
        } else {
          setErrorJobs("Không thể tải danh sách việc làm.");
        }
      } catch (err: any) {
        setErrorJobs("Lỗi tải việc làm.");
        console.error("Fetch Jobs Error:", err);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      setErrorProvinces(null);
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        if (response.data && Array.isArray(response.data)) {
          setProvinces(response.data as IProvince[]);
        } else {
          setErrorProvinces("Không thể tải danh sách tỉnh/thành phố. Dữ liệu không hợp lệ.");
          console.error("Invalid province data structure:", response.data);
        }
      } catch (err: any) {
        setErrorProvinces("Lỗi tải tỉnh/thành phố.");
        console.error("Fetch Provinces Error:", err);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchCompanies();
    fetchJobs();
    fetchProvinces();
  }, []);

  const handleSearch = () => {
    const trimmedName = searchName.trim();
    const queryParams = new URLSearchParams();
    if (trimmedName) {
      queryParams.set('name', trimmedName);
    }
    if (searchLocation) {
      queryParams.set('location', searchLocation);
    }
    navigate(`/jobs/search?${queryParams.toString()}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-black py-12 px-4">
        <div className="container mx-auto max-w-5xl bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2">
          <div className="relative w-full md:w-1/4">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              disabled={isLoadingProvinces}
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            >
              <option value="">Tất cả thành phố</option>
              {isLoadingProvinces ? (
                <option disabled>Đang tải...</option>
              ) : errorProvinces ? (
                <option disabled>Lỗi tải</option>
              ) : (
                provinces.map((province) => (
                  <option key={province.code} value={province.name}>
                    {province.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="relative w-full md:flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Nhập từ khoá theo kỹ năng, chức vụ, công ty..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            className="w-full md:w-auto bg-red-600 text-white px-6 py-2.5 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center text-sm font-medium"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Tìm kiếm
          </button>
        </div>
        <div className="container mx-auto max-w-4xl mt-4 flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Gợi ý cho bạn:</span>
          <Link to="/search?q=html5" className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-600 text-xs">HTML5</Link>
          <Link to="/search?q=wordpress" className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-600 text-xs">Wordpress</Link>
        </div>
      </section>

      <section className="bg-white py-3 border-b border-t border-gray-200">
         <div className="container mx-auto max-w-6xl text-center">
             <Link to="/offers" className="text-sm text-gray-700 hover:text-red-600">
                 <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded mr-1">HOT</span>
                 Khám phá <strong>Lời mời công việc</strong> - x2 tốc độ tìm việc và có cơ hội nhận lịch độc quyền!
                 <ArrowRightIcon className="inline-block h-4 w-4 ml-1" />
            </Link>
         </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Công cụ tốt nhất cho hành trang ứng tuyển của bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
              <img src="https://img.icons8.com/plasticine/100/resume.png" alt="Hồ sơ cá nhân" className="h-20 w-20 mb-4 object-contain" />
              <h3 className="text-lg font-semibold mb-2">Hồ sơ cá nhân</h3>
              <p className="text-sm text-gray-600 mb-4 flex-grow">Kiến tạo hồ sơ ITviec với cấu trúc chuẩn mực cùng các gợi ý chi tiết</p>
              <Link to="/profile" className="mt-auto inline-block px-5 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition duration-200 text-sm font-medium">Cập nhật hồ sơ</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
              <img src="https://img.icons8.com/plasticine/100/document.png" alt="Mẫu CV" className="h-20 w-20 mb-4 object-contain" />
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                  Mẫu CV 
                  <span className="ml-2 bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded">MỚI</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4 flex-grow">Nâng cấp CV với các mẫu CV IT chuyên nghiệp - được nhà tuyển dụng đề xuất</p>
              <Link to="/profile" className="mt-auto inline-block px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm font-medium">Xem mẫu CV</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center">
              <img src="https://img.icons8.com/plasticine/100/news.png" alt="Blog IT" className="h-20 w-20 mb-4 object-contain" />
              <h3 className="text-lg font-semibold mb-2">Blog về IT</h3>
              <p className="text-sm text-gray-600 mb-4 flex-grow">Cập nhật thông tin lương thưởng, nghề nghiệp và kiến thức ngành IT</p>
              <Link to="/blog" className="mt-auto inline-block px-5 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition duration-200 text-sm font-medium">Khám phá blog</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Việc làm mới nhất</h2>
          
          {isLoadingJobs && (
             <div className="text-center py-10"><Spinner /></div>
          )}

          {!isLoadingJobs && errorJobs && (
              <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
                 <p>Lỗi: {errorJobs}</p>
              </div>
          )}

          {!isLoadingJobs && !errorJobs && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.length > 0 ? (
                         jobs.map((job) => (
                            <Link 
                                key={job._id} 
                                to={`/job/${job._id}`} 
                                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200 hover:border-indigo-300 p-5"
                               >
                                <div className="flex flex-col sm:flex-row gap-4">
                                     <div className="flex-shrink-0">
                                         <img 
                                            src={job.company?.logo || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=Cty'} 
                                            alt={`${job.company?.name || 'Company'} logo`} 
                                            className="h-14 w-14 object-contain border rounded-md p-1 bg-white"
                                          />
                                     </div>
                                     <div className="flex-grow overflow-hidden">
                                         <h3 className="font-semibold text-indigo-700 mb-1 truncate text-lg" title={job.name}>{job.name}</h3>
                                         <p className="text-sm text-gray-600 mb-2 truncate" title={job.company?.name || 'Không rõ công ty'}>{job.company?.name || 'Không rõ công ty'}</p>
                                         <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-3 gap-y-1">
                                              <span className="flex items-center whitespace-nowrap">
                                                 <CurrencyDollarIcon className="h-4 w-4 mr-1"/> 
                                                 {job.salary ? `${job.salary.toLocaleString()} đ` : 'Thỏa thuận'}
                                              </span> 
                                              <span className="flex items-center whitespace-nowrap truncate">
                                                  <MapPinIcon className="h-4 w-4 mr-1"/>
                                                  <span className="truncate">{job.location}</span>
                                              </span>
                                         </div>
                                     </div>
                                     <div className="flex flex-col sm:items-end space-y-1 mt-2 sm:mt-0 flex-shrink-0">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">Đăng: {dayjs(job.createdAt).format('DD/MM/YYYY')}</span>
                                        <div className="flex items-center space-x-1.5">
                                            {job.isActive && <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[11px] font-medium">Đang tuyển</span>}
                                            {job.isHot && <span className="inline-block bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[11px] font-medium">HOT</span>}
                                        </div>
                                     </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                         <p className="col-span-full text-center text-gray-500 py-10">Không tìm thấy việc làm nào.</p>
                    )}
                </div>
                <div className="text-center mt-10">
                    <Link 
                        to="/jobs"
                        className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition duration-200 text-sm font-medium"
                    >
                        Xem tất cả việc làm
                    </Link>
                </div>
            </>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Nhà tuyển dụng hàng đầu</h2>
          
          {isLoadingCompanies && (
             <div className="text-center py-10">
                 <Spinner />
             </div>
          )}

          {!isLoadingCompanies && errorCompanies && (
              <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
                 <p>Lỗi: {errorCompanies}</p>
              </div>
          )}

          {!isLoadingCompanies && !errorCompanies && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.length > 0 ? (
                         companies.map((company) => (
                            <Link key={company._id} to={`/company/${company._id}`} className="block bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden p-5 border border-gray-200">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-4">
                                        <img 
                                            src={company.logo || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Logo'}
                                            alt={`${company.name} logo`} 
                                            className="h-14 w-14 object-contain mr-4 border rounded-md p-1 bg-white"
                                        />
                                        <span className="font-semibold text-gray-800 flex-1 truncate">{company.name}</span>
                                    </div>
                                    <div className="mb-4 min-h-[20px]"> 
                                        <p className="text-sm text-gray-500 truncate">{company.address || 'Địa chỉ chưa cập nhật'}</p> 
                                    </div>
                                    <div className="mt-auto flex justify-between items-center text-sm text-gray-600 pt-3 border-t border-gray-200">
                                        <div className="flex items-center space-x-1 truncate">
                                            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <span className="truncate" title={company.address || 'Chưa rõ'}>{company.address || 'Chưa rõ'}</span> 
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                         <p className="col-span-full text-center text-gray-500 py-10">Không tìm thấy công ty nào.</p>
                    )}
                </div>
                <div className="text-center mt-10">
                    <Link 
                        to="/companies"
                        className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition duration-200 text-sm font-medium"
                    >
                        Xem tất cả công ty
                    </Link>
                </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 