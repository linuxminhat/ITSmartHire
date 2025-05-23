import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogService } from '@/services/blog.service'
import type { IBlog } from '@/types/blog.type'
import Spinner from '@/components/Spinner'
import Breadcrumb from '@/components/shared/Breadcrumb'
import { DocumentTextIcon, PencilIcon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import BlogFilter, { BlogFilterState } from './BlogFilter'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

interface IPagination {
  current: number
  pageSize: number
  pages: number
  total: number
}

const ManageBlogsPage: React.FC = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<IBlog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<IPagination>({
    current: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
  })
  const [filter, setFilter] = useState<BlogFilterState>({ title: '', tag: '' })

  const buildQuery = (page = pagination.current, size = pagination.pageSize, f = filter) => {
    let q = `current=${page}&pageSize=${size}&sort=-updatedAt`
    if (f.title.trim()) q += `&search=${encodeURIComponent(f.title.trim())}`
    if (f.tag.trim()) q += `&tag=${encodeURIComponent(f.tag.trim())}`
    return q
  }

  const fetchBlogs = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const finalQ = q ?? buildQuery()
      const res = await blogService.getAll(finalQ)
      if (res?.data) {
        setBlogs(res.data.result)
        setPagination(res.data.meta)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter, pagination.current, pagination.pageSize])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const handleSearch = () => {
    setPagination(p => ({ ...p, current: 1 }))
    fetchBlogs(buildQuery(1, pagination.pageSize))
  }

  const handleReset = () => {
    const emptyFilter = { title: '', tag: '' }
    setFilter(emptyFilter)
    setPagination(p => ({ ...p, current: 1 }))
    fetchBlogs(buildQuery(1, pagination.pageSize, emptyFilter))
  }

  const handleExport = () => {
    if (!blogs.length) return alert('Không có dữ liệu để xuất')

    const data = blogs.map((blog, i) => ({
      STT: (pagination.current - 1) * pagination.pageSize + i + 1,
      'Tiêu đề': blog.title,
      'Mô tả': blog.description,
      'Trạng thái': blog.status === 'published' ? 'Đã đăng' : 'Nháp',
      'Tags': (blog.tags && blog.tags.length) ? blog.tags.join(', ') : '',
      'Ngày cập nhật': blog.updatedAt ? dayjs(blog.updatedAt).format('DD/MM/YYYY') : '-',
      'Lượt xem': blog.views || 0,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Blogs')

    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([blob]), `blogs_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
    alert(`Đã xuất ${data.length} bài viết`)
  }

  const handleEdit = (id: string) => navigate(`${id}/edit`)
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Xác nhận xóa bài viết này?')) return
    await blogService.delete(id)
    fetchBlogs()
  }

  const handleAddNew = () => {
    navigate('/admin/blogs/new')
  }

  const renderPagination = () => {
    const totalPages = pagination.pages;
    const currentPage = pagination.current;
    
    // Giới hạn hiển thị tối đa 5 nút số trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
          disabled={currentPage <= 1}
          className={`px-3 py-1 rounded border ${currentPage <= 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-600'}`}
        >
          Trước
        </button>
        
        {startPage > 1 && (
          <>
            <button 
              onClick={() => setPagination(p => ({ ...p, current: 1 }))}
              className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setPagination(p => ({ ...p, current: number }))}
            className={`px-3 py-1 rounded border ${number === currentPage 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-blue-600 hover:bg-blue-50'}`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button 
              onClick={() => setPagination(p => ({ ...p, current: totalPages }))}
              className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1 rounded border ${currentPage >= totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-600'}`}
        >
          Sau
        </button>
        
        <select
          value={pagination.pageSize}
          onChange={(e) => setPagination(p => ({ ...p, current: 1, pageSize: Number(e.target.value) }))}
          className="ml-4 border rounded px-2 py-1 bg-white text-gray-700"
        >
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
        </select>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={[{ label: 'Quản lý Bài viết', icon: DocumentTextIcon }]} />
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* Filter + Action Bar */}
        <div className="flex items-center mb-6 pb-4 border-b border-gray-200 gap-2">
          {/* Left side - Filter inputs */}
          <div className="flex-1">
            <BlogFilter
              value={filter}
              onChange={setFilter}
              onReset={handleReset}
              onSearch={handleSearch}
            />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 border border-gray-300 bg-white rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Làm lại
            </button>
            
            <button
              onClick={handleSearch}
              className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
              Tìm kiếm
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất File
            </button>

            <button
              onClick={handleAddNew}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Thêm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày cập nhật</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {blog.thumbnail && (
                            <img 
                              src={blog.thumbnail} 
                              alt={blog.title} 
                              className="h-10 w-10 object-cover rounded mr-3"
                            />
                          )}
                          <div className="line-clamp-1 font-medium text-gray-900 max-w-md">{blog.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            blog.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {blog.status === 'published' ? 'Đã đăng' : 'Nháp'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.tags && blog.tags.length > 0 ? (
                            blog.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Chưa có tag</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(blog._id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Xóa"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Không có bài viết nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Tổng: <span className="font-medium">{pagination.total}</span> bài viết
              </div>
              
              {renderPagination()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ManageBlogsPage
