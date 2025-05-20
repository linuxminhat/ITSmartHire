import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '@/services/blog.service';
import { IBlog } from '@/types/blog.type';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import { TagIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface IPagination {
  current: number;
  pageSize: number;
  pages: number;
  total: number;
}

const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState<IPagination>({
    current: 1,
    pageSize: 6,   // mỗi trang 6 bài
    pages: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchBlogs = async (page = meta.current, keyword = searchTerm) => {
      try {
        setLoading(true);
        setError(null);

        // build query string
        const parts = [
          `current=${page}`,
          `pageSize=${meta.pageSize}`,
          `sort=-createdAt`,
        ];
        if (keyword) parts.push(`search=${encodeURIComponent(keyword)}`);
        const q = parts.join('&');

        const response = await blogService.getAll(q);
        if (response?.data?.result) {
          setBlogs(response.data.result);
          // áp dụng meta từ response
          setMeta(response.data.meta);
        } else {
          setError('Không thể tải danh sách bài viết');
        }
      } catch (err) {
        setError('Không thể tải danh sách bài viết');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    // mỗi khi meta.current hoặc searchTerm đổi, reload
    fetchBlogs(meta.current, searchTerm);
  }, [meta.current, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta(prev => ({ ...prev, current: 1 }));
  };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.pages) {
      setMeta(prev => ({ ...prev, current: newPage }));
    }
  };
  const renderPagination = () => {
    if (meta.pages <= 1) return null;
    const pageNumbers: number[] = [];
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
      <nav className="flex items-center justify-center mt-8" aria-label="Pagination">
        <button
          onClick={() => handlePageChange(meta.current - 1)}
          disabled={meta.current === 1}
          className="px-3 py-1 border rounded-l disabled:opacity-50"
        >
          Trước
        </button>

        {startPage > 1 && (
          <button onClick={() => handlePageChange(1)} className="px-3 py-1 border">
            1
          </button>
        )}
        {startPage > 2 && <span className="px-3 py-1">…</span>}

        {pageNumbers.map(num => (
          <button
            key={num}
            onClick={() => handlePageChange(num)}
            className={`px-3 py-1 border ${num === meta.current ? 'bg-indigo-600 text-white' : ''
              }`}
          >
            {num}
          </button>
        ))}

        {endPage < meta.pages - 1 && <span className="px-3 py-1">…</span>}
        {endPage < meta.pages && (
          <button onClick={() => handlePageChange(meta.pages)} className="px-3 py-1 border">
            {meta.pages}
          </button>
        )}

        <button
          onClick={() => handlePageChange(meta.current + 1)}
          disabled={meta.current === meta.pages}
          className="px-3 py-1 border rounded-r disabled:opacity-50"
        >
          Sau
        </button>
      </nav>
    );
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          {/* SEARCH BOX */}
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner />
          </div>
        </div>
      </div >
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 text-center">
        <div className="container mx-auto px-4">
          {/* 2) Heading */}
          <h1 className="text-3xl md:text-4xl font-bold whitespace-nowrap mb-8">
            ITSmartHire Blog&nbsp;–&nbsp;Ý tưởng phát triển sự nghiệp IT của bạn
          </h1>
          {/* wrapper chung max-w-4xl để search + title + subtitle cùng độ rộng */}
          <div className="mx-auto w-full max-w-4xl space-y-6">

            {/* 1) Search form rộng full */}
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 w-full px-4 py-2 rounded-l-lg focus:outline-none text-gray-900"
              />
              <button
                type="submit"
                className="px-6 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition"
              >
                Tìm kiếm
              </button>
            </form>

          </div>
        </div>
      </section>
      {/* === PAGE BODY: giữ nguyên background trắng/xám như cũ === */}
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4 mt-[-40px] pb-12">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {/* 4. Grid các bài blog */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map(blog => (
                    <Link
                      key={blog._id}
                      to={`/blog/${blog._id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                    >
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={blog.thumbnail || 'https://via.placeholder.com/800x450?text=Blog+Image'}
                          alt={blog.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {blog.title}
                        </h2>
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
                  ))}
                </div>

                {/* 5. Khi không có blog nào */}
                {blogs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Chưa có bài viết nào.</p>
                  </div>
                )}
              </>
            )}
          </div>
          {renderPagination()}
        </div>
      </div>
    </>
  );
};

export default BlogListPage; 