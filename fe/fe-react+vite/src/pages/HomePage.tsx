import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinIcon, MagnifyingGlassIcon, BuildingOffice2Icon, ArrowRightIcon, BriefcaseIcon, CurrencyDollarIcon, TagIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { callFetchCompany } from '@/services/company.service';
import { callFetchJob } from '@/services/job.service';
import { ICompany, IJob } from '@/types/backend';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import axios from 'axios';
import resumeToolsBanner from '@/assets/images/resume-tools-banner.jpg';
import latestJobsBanner from '@/assets/images/latest-jobs-banner.jpg';
import topEmployersBanner from '@/assets/images/top-employers-banner.jpg';
import companiesBanner from '@/assets/images/companies-banner.jpg';
import { blogService } from '@/services/blog.service';
import { IBlog } from '@/types/blog.type';
import blogSectionBanner from '@/assets/images/blog-section-banner.jpg';
import { ISkill } from '@/types/backend';
import { callFetchSkill } from '@/services/skill.service';
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
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState<boolean>(true);
  const [errorBlogs, setErrorBlogs] = useState<string | null>(null);
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);
  const [errorSkills, setErrorSkills] = useState<string | null>(null);

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

    const fetchBlogs = async () => {
      setIsLoadingBlogs(true);
      setErrorBlogs(null);
      try {
        const res = await blogService.getAll('current=1&pageSize=3&sort=-createdAt');
        if (res && res.data) {
          setBlogs(res.data.result);
        } else {
          setErrorBlogs("Không thể tải danh sách bài viết.");
        }
      } catch (err: any) {
        setErrorBlogs("Lỗi tải bài viết.");
        console.error("Fetch Blogs Error:", err);
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      setErrorSkills(null);
      try {
        const res = await callFetchSkill('current=1&pageSize=12&sort=name');
        if (res && res.data) {
          setSkills(res.data.result);
        } else {
          setErrorSkills("Không thể tải danh sách kỹ năng.");
        }
      } catch (err: any) {
        setErrorSkills("Lỗi tải kỹ năng.");
        console.error("Fetch Skills Error:", err);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchCompanies();
    fetchJobs();
    fetchProvinces();
    fetchBlogs();
    fetchSkills();
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
      {/* Search section */}
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
        <div className="container mx-auto max-w-4xl mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-400">Gợi ý cho bạn:</span>
          {isLoadingSkills ? (
            <span className="text-gray-400 text-xs">Đang tải...</span>
          ) : errorSkills ? (
            <span className="text-red-400 text-xs">{errorSkills}</span>
          ) : (
            skills.map((skill) => (
              <Link
                key={skill._id}
                to={`/jobs/skill/${skill._id}`}
                className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-600 text-xs transition-colors"
              >
                {skill.name}
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Resume Tools section */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Công cụ tốt nhất cho hành trang ứng tuyển của bạn</h2>

          {/* Banner image */}
          <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
            <img
              src={resumeToolsBanner}
              alt="Công cụ ứng tuyển"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Tạo CV Ấn Tượng</h3>
                <p className="text-lg">Công cụ chuyên nghiệp giúp bạn nổi bật</p>
              </div>
            </div>
          </div>

          {/* Cards Grid - Điều chỉnh grid và gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {/* Card 1 - Hồ sơ cá nhân */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center transform transition duration-300 hover:shadow-lg">
              <img
                src="https://img.icons8.com/plasticine/100/resume.png"
                alt="Hồ sơ cá nhân"
                className="h-24 w-24 mb-6 object-contain" // Tăng kích thước icon
              />
              <h3 className="text-xl font-semibold mb-4">Hồ sơ cá nhân</h3>
              <p className="text-base text-gray-600 mb-6 flex-grow">Kiến tạo hồ sơ ITviec với cấu trúc chuẩn mực cùng các gợi ý chi tiết</p>
              <Link
                to="/profile"
                className="w-full py-3 border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 transition duration-200 text-base font-medium"
              >
                Cập nhật hồ sơ
              </Link>
            </div>

            {/* Card 2 - Mẫu CV */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center transform transition duration-300 hover:shadow-lg">
              <img
                src="https://img.icons8.com/plasticine/100/document.png"
                alt="Mẫu CV"
                className="h-24 w-24 mb-6 object-contain"
              />
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                Mẫu CV
                <span className="ml-2 bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded">MỚI</span>
              </h3>
              <p className="text-base text-gray-600 mb-6 flex-grow">Chỉnh sửa hồ sơ và khám phá 4 mẫu CV đa phong cách.</p>
              <Link
                to="/profile"
                className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-base font-medium"
              >
                Xem mẫu CV
              </Link>
            </div>

            {/* Card 3 - Blog về IT */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center transform transition duration-300 hover:shadow-lg">
              <img
                src="https://img.icons8.com/plasticine/100/news.png"
                alt="Blog IT"
                className="h-24 w-24 mb-6 object-contain"
              />
              <h3 className="text-xl font-semibold mb-4">Blog về IT</h3>
              <p className="text-base text-gray-600 mb-6 flex-grow">Cập nhật thông tin lương thưởng, nghề nghiệp và kiến thức ngành IT</p>
              <Link
                to="/blog"
                className="w-full py-3 border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 transition duration-200 text-base font-medium"
              >
                Khám phá blog
              </Link>
            </div>

            {/* Card 4 - Phỏng vấn giả lập */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center transform transition duration-300 hover:shadow-lg">
              <img
                src="https://img.icons8.com/plasticine/100/communication.png"
                alt="Phỏng vấn giả lập"
                className="h-24 w-24 mb-6 object-contain"
              />
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                Phỏng vấn giả lập
                <span className="ml-2 bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded">MỚI</span>
              </h3>
              <p className="text-base text-gray-600 mb-6 flex-grow">Mô phỏng phỏng vấn chuyên môn với AI</p>
              <Link
                to="/mock-interview"
                className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-base font-medium"
              >
                Bắt đầu phỏng vấn
              </Link>
            </div>

            {/* Card 5 - Hỗ trợ viết CV */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center transform transition duration-300 hover:shadow-lg">
              <img
                src="https://img.icons8.com/plasticine/100/edit-file.png"
                alt="Hỗ trợ viết CV"
                className="h-24 w-24 mb-6 object-contain"
              />
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                Hỗ trợ viết CV
                <span className="ml-2 bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded">MỚI</span>
              </h3>
              <p className="text-base text-gray-600 mb-6 flex-grow">Viết CV chuẩn nội dung ATS theo gợi ý AI</p>
              <Link
                to="/cv-assistant"
                className="w-full py-3 border-2 border-red-600 text-red-600 rounded-md hover:bg-red-50 transition duration-200 text-base font-medium"
              >
                Tạo CV ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Việc làm mới nhất</h2>

          {/* Banner image */}
          <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
            <img
              src={latestJobsBanner}
              alt="Việc làm mới nhất"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Cơ Hội Việc Làm IT</h3>
                <p className="text-lg">Khám phá hàng nghìn vị trí hấp dẫn</p>
              </div>
            </div>
          </div>

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
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              {job.salary ? `${job.salary.toLocaleString()} đ` : 'Thỏa thuận'}
                            </span>
                            <span className="flex items-center whitespace-nowrap truncate">
                              <MapPinIcon className="h-4 w-4 mr-1" />
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

      {/* Top Employers section */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Nhà tuyển dụng hàng đầu</h2>

          {/* Banner image */}
          <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
            <img
              src={topEmployersBanner}
              alt="Nhà tuyển dụng hàng đầu"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Công Ty IT Hàng Đầu</h3>
                <p className="text-lg">Môi trường làm việc chuyên nghiệp</p>
              </div>
            </div>
          </div>

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

      {/* Blog section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Blog IT - Kiến thức và Kinh nghiệm</h2>

          {/* Banner image */}
          <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
            <img
              src={blogSectionBanner}
              alt="Blog IT"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Cập Nhật Xu Hướng IT</h3>
                <p className="text-lg">Kiến thức chuyên môn & Phát triển nghề nghiệp</p>
              </div>
            </div>
          </div>

          {isLoadingBlogs && (
            <div className="text-center py-10"><Spinner /></div>
          )}

          {!isLoadingBlogs && errorBlogs && (
            <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
              <p>Lỗi: {errorBlogs}</p>
            </div>
          )}

          {!isLoadingBlogs && !errorBlogs && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <Link
                      key={blog._id}
                      to={`/blog/${blog._id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
                    >
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={blog.thumbnail || 'https://via.placeholder.com/800x450?text=Blog+Image'}
                          alt={blog.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {blog.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags?.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {dayjs(blog.createdAt).format('DD/MM/YYYY')}
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {blog.views || 0} lượt xem
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-10">Chưa có bài viết nào.</p>
                )}
              </div>
              <div className="text-center mt-10">
                <Link
                  to="/blog"
                  className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition duration-200 text-sm font-medium"
                >
                  Xem tất cả blog
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