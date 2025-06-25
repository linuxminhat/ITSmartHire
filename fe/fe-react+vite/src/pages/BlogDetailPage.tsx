import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '@/services/blog.service';
import { IBlog } from '@/types/blog.type';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import { TagIcon, EyeIcon, CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<IBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hasIncrementedView = useRef(false);
  const currentBlogId = useRef<string | null>(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!id) return;
      
      if (currentBlogId.current !== id) {
        hasIncrementedView.current = false;
        currentBlogId.current = id;
      }
      
      try {
        setLoading(true);
        setError(null);

        if (!hasIncrementedView.current) {
          console.log('[DEBUG] Tăng lượt xem cho blog:', id);
          hasIncrementedView.current = true;
          await blogService.incrementView(id);
        }

        const response = await blogService.getById(id);
        if (response?.data) {
          setBlog(response.data);
        } else {
          setError('Không tìm thấy bài viết');
        }
      } catch (err) {
        setError('Không thể tải thông tin bài viết');
        console.error('Error fetching blog detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
            {error || 'Không tìm thấy bài viết'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          to="/blog"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Quay lại danh sách
        </Link>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {blog.thumbnail && (
            <div className="w-full h-[400px]">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {dayjs(blog.createdAt).format('DD/MM/YYYY')}
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                {blog.views || 0} lượt xem
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <TagIcon className="w-4 h-4 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </div>
        </article>

        {/* Phần Related Posts có thể thêm sau */}
      </div>
    </div>
  );
};

export default BlogDetailPage; 