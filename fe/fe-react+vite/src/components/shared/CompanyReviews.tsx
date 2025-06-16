import React, { useState, useEffect, useContext } from 'react';
import { ICompany, ICompanyComment } from '@/types/backend';
import { callCreateComment, callDeleteComment } from '@/services/comment.service';
import { StarIcon, TrashIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { AuthContext } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner';
import { Editor } from '@tinymce/tinymce-react';
import { uploadFile } from '@/services/storage.service';

interface CompanyReviewsProps {
  company: ICompany;
  initialComments: ICompanyComment[];
  isLoading: boolean;
  refetch: () => void;
}

const CompanyReviews: React.FC<CompanyReviewsProps> = ({ company, initialComments, isLoading, refetch }) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const user = authContext?.user ?? null;

  const [comments, setComments] = useState<ICompanyComment[]>(initialComments);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    const trimmedComment = newComment.replace(/<p>(\s|&nbsp;)*<\/p>/g, '').trim();
    if (!trimmedComment) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      const commentData = {
        companyId: company._id,
        rating: newRating,
        comment: newComment
      };
      const result = await callCreateComment(commentData);
      
      if (result && result.data) {
        toast.success('Đánh giá của bạn đã được gửi thành công!');
        setNewComment('');
        setNewRating(5);
        setComments(prevComments => [result.data, ...prevComments]);
        refetch();
        setCurrentPage(1);
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi gửi đánh giá.');
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi gửi đánh giá. Vui lòng thử lại.';
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }
    try {
      await callDeleteComment(commentId);
      toast.success('Đánh giá đã được xóa');
      setComments(prevComments => prevComments.filter(c => c._id !== commentId));
      refetch();
    } catch (error: any)
    {
      console.error('Error deleting comment:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa đánh giá');
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarSolidIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const averageRating = comments.length > 0 ? comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length : 0;

  const ratingDistribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (comments.length > 0) {
    for (const comment of comments) {
      if (ratingDistribution[comment.rating] !== undefined) {
        ratingDistribution[comment.rating]++;
      }
    }
  }

  const starColors: { [key: number]: string } = {
    5: 'bg-green-500',
    4: 'bg-teal-400',
    3: 'bg-yellow-400',
    2: 'bg-orange-400',
    1: 'bg-red-500',
  };

  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const paginatedComments = comments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center mt-8 space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-700">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đánh giá từ cộng đồng</h3>
        <div className="flex flex-col sm:flex-row items-center p-4">
          <div className="flex flex-col items-center justify-center w-full sm:w-1/3 text-center sm:border-r sm:border-gray-200 sm:pr-8">
            <p className="text-6xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            <div className="my-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-base text-gray-600">
              Từ <span className="font-semibold">{comments.length}</span> đánh giá
            </p>
          </div>
          
          <div className="w-full sm:w-2/3 mt-6 sm:mt-0 sm:pl-8">
            <div className="space-y-3">
              {Object.keys(ratingDistribution).sort((a, b) => Number(b) - Number(a)).map((star) => {
                const starNum = Number(star);
                const count = ratingDistribution[starNum];
                const percentage = comments.length > 0 ? Math.round((count / comments.length) * 100) : 0;
                return (
                  <div key={star} className="flex items-center space-x-3 text-sm">
                    <span className="text-gray-700 font-medium w-6 text-right">{star}★</span>
                    <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${starColors[starNum]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-700 font-semibold w-10 text-right">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h4 className="font-semibold text-gray-800 mb-3">Để lại đánh giá của bạn</h4>
          <div className="mb-3">{renderStars(newRating, true, setNewRating)}</div>
          
          <Editor
            apiKey='nxdd2bqfluksusq6r978zthgxs1fy7u37qyu343ew2r05qiq'
            value={newComment}
            onEditorChange={(content) => setNewComment(content)}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'imagetools'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'image link | removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              placeholder: "Chia sẻ trải nghiệm của bạn về văn hóa công ty, lương thưởng, cơ hội phát triển...",
              automatic_uploads: true,
              images_reuse_filename: true,
              images_upload_handler: function (blobInfo, progress) {
                  return new Promise((resolve, reject) => {
                      const file = new File([blobInfo.blob()], blobInfo.filename());
                      uploadFile(file, 'comment-images', (p) => {
                          if (progress) progress(p);
                      })
                          .then(url => {
                              resolve(url);
                          })
                          .catch(err => {
                              reject('Upload thất bại: ' + err.message);
                          });
                  });
              },
              paste_data_images: true,
              file_picker_types: 'image',
              file_picker_callback: function (callback, value, meta) {
                  if (meta.filetype === 'image') {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');
                      input.onchange = function () {
                          if (input.files?.[0]) {
                              const file = input.files[0];
                              uploadFile(file, 'comment-images', () => {})
                                  .then(url => {
                                      callback(url, { title: file.name });
                                  })
                                  .catch(err => {
                                      console.error('Lỗi upload ảnh:', err);
                                  });
                          }
                      };
                      input.click();
                  }
              }
            }}
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8"><Spinner /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá công ty này!
          </div>
        ) : (
          paginatedComments.map((comment) => {
            const isOwner = user?._id === (typeof comment.userId === 'object' ? comment.userId._id : comment.userId);
            const isAdmin = user?.role?.name === 'ADMIN';

            return (
              <article key={comment._id} className="flex items-start space-x-4 p-5 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="font-semibold text-gray-900">
                              {typeof comment.userId === 'object' ? comment.userId.name : 'Người dùng ẩn danh'}
                          </p>
                          <div className="flex items-center mt-1">
                              {renderStars(comment.rating)}
                          </div>
                      </div>
                      <div className="flex items-center space-x-4">
                          <time dateTime={comment.createdAt} className="text-sm text-gray-500">
                              {dayjs(comment.createdAt).format('DD/MM/YYYY')}
                          </time>
                          {(isOwner || isAdmin) && (
                              <button
                                  onClick={() => handleDeleteComment(comment._id!)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                  title="Xóa đánh giá"
                              >
                                  <TrashIcon className="h-4 w-4" />
                              </button>
                          )}
                      </div>
                  </div>
                  <div className="prose prose-sm mt-3 max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: comment.comment }} />
                </div>
              </article>
            );
          })
        )}
        {renderPagination()}
      </div>

      {!isAuthenticated && (
        <div className="mt-8 text-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
          <p className="text-gray-600">Vui lòng <Link to="/login" className="text-indigo-600 font-semibold hover:underline">đăng nhập</Link> để chia sẻ đánh giá của bạn.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyReviews; 