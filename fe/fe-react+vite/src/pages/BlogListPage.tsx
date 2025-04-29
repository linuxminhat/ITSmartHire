import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '@/services/blog.service';
import { IBlog } from '@/types/blog.type';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import { TagIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';

const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getAll('current=1&pageSize=12&sort=-createdAt');
        if (response?.data?.result) {
          setBlogs(response.data.result);
        }
      } catch (err) {
        setError('Không thể tải danh sách bài viết');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner />
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog IT</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá những kiến thức, xu hướng mới nhất trong ngành IT và các bài viết hữu ích cho sự nghiệp của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
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
                  {blog.tags?.map((tag, index) => (
                    <span
                      key={index}
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

        {blogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có bài viết nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage; 