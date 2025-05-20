import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogService } from '@/services/blog.service'
import type { IBlog } from '@/types/blog.type'
import Spinner from '@/components/Spinner'

interface IPagination {
  current: number
  pageSize: number
  total: number
}

const ManageBlogsPage: React.FC = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<IBlog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<IPagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await blogService.getAll(
        `current=${pagination.current}&pageSize=${pagination.pageSize}&sort=-updatedAt`
      )
      if (res?.data) {
        setBlogs(res.data.result)
        setPagination(res.data.meta)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [pagination.current, pagination.pageSize])

  const handleAdd = () => navigate('new')
  const handleEdit = (id: string) => navigate(`${id}/edit`)
  const handleDelete = async (id: string) => {
    if (!window.confirm('Xác nhận xóa?')) return
    await blogService.delete(id)
    fetchBlogs()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Bài viết</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm bài viết
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Tiêu đề</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b._id} className="border-t">
                  <td className="p-4">{b.title}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${b.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                        }`}
                    >
                      {b.status === 'published' ? 'Đã đăng' : 'Nháp'}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleEdit(b._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div>Tổng: {pagination.total} bài viết</div>
            <div className="space-x-2">
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, current: p.current - 1 }))
                }
                disabled={pagination.current <= 1}
                className="px-3 py-1 border rounded"
              >
                Trước
              </button>
              <span>{pagination.current}</span>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, current: p.current + 1 }))
                }
                disabled={
                  pagination.current >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
                className="px-3 py-1 border rounded"
              >
                Sau
              </button>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  setPagination((p) => ({
                    ...p,
                    current: 1,
                    pageSize: Number(e.target.value),
                  }))
                }
                className="ml-4 border rounded px-2 py-1"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ManageBlogsPage
