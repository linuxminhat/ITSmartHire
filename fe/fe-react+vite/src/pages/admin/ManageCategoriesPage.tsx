// src/pages/admin/category/ManageCategoriesPage.tsx
import React, { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '@/components/shared/Breadcrumb'
import CategoryFilter, { CategoryFilterState } from './CategoryFilter'
import CategoryTable from '@/components/admin/category/CategoryTable'
import CategoryModal from '@/components/admin/category/CategoryModal'
import { callFetchCategory, callDeleteCategory } from '@/services/category.service'
import { ICategory } from '@/types/backend'
import { toast } from 'react-toastify'
import { PlusIcon, RectangleGroupIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

const ManageCategoriesPage: React.FC = () => {

  const [categories, setCategories] = useState<ICategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [meta, setMeta] = useState({ current: 1, pageSize: 10, pages: 0, total: 0 })
  const [filter, setFilter] = useState<CategoryFilterState>({ name: '', skill: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dataInit, setDataInit] = useState<ICategory | null>(null)

  //building query string for API 
  const buildQuery = (page = meta.current, size = meta.pageSize, f = filter) => {
    let q = `current=${page}&pageSize=${size}`
    if (f.name.trim()) q += `&name=${encodeURIComponent(f.name.trim())}`
    if (f.skill.trim()) q += `&skill=${encodeURIComponent(f.skill.trim())}`
    return q
  }

  const fetchCategories = useCallback(
    async (q?: string) => {
      setIsLoading(true)
      try {
        const finalQ = q ?? buildQuery()
        const res = await callFetchCategory(finalQ)
        if (res?.data) {
          setCategories(res.data.result)
          setMeta(res.data.meta)
        } else {
          toast.error(res?.message || 'Không thể tải danh mục')
        }
      } catch (err: any) {
        console.error(err)
        toast.error('Lỗi khi tải danh mục')
      } finally {
        setIsLoading(false)
      }
    },
    [filter, meta.current, meta.pageSize]
  )

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleReset = () => {
    setFilter({ name: '', skill: '' })
    setMeta(m => ({ ...m, current: 1 }))
    fetchCategories(buildQuery(1, meta.pageSize, { name: '', skill: '' }))
    toast.info('Đã làm mới bộ lọc')
  }

  const handleSearch = () => {
    setMeta(m => ({ ...m, current: 1 }))
    fetchCategories(buildQuery(1, meta.pageSize))
  }

  const handleExport = () => {
    if (!categories.length) return toast.info('Không có dữ liệu để xuất')

    const data = categories.map((c, i) => ({
      STT: (meta.current - 1) * meta.pageSize + i + 1,
      'Tên danh mục': c.name,
      'Số kỹ năng': c.skills?.length || 0,
      'Mô tả': c.description || '-',
      'Trạng thái': c.isActive ? 'ACTIVE' : 'INACTIVE',
      'Ngày tạo': dayjs(c.createdAt).format('DD/MM/YYYY'),
      'Lượt tuyển': c.recruitCount || 0,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Categories')

    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([blob]), `categories_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
    toast.success(`Đã xuất ${data.length} dòng`)
  }

  const handleAdd = () => {
    setDataInit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (c: ICategory) => {
    setDataInit(c)
    setIsModalOpen(true)
  }

  const handleDelete = async (c: ICategory) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${c.name}" không?`)) return
    setIsLoading(true)
    try {
      await callDeleteCategory(c._id!)
      toast.success('Xóa thành công')
      const newPage = meta.current > 1 && categories.length === 1 ? meta.current - 1 : meta.current
      fetchCategories(buildQuery(newPage, meta.pageSize))
    } catch {
      toast.error('Lỗi khi xóa')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePage = (p: number, sz?: number) => {
    const newSize = sz ?? meta.pageSize
    setMeta(m => ({ ...m, current: p, pageSize: newSize }))
    fetchCategories(buildQuery(p, newSize))
  }


  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={[{ label: 'Quản lý Danh mục', icon: RectangleGroupIcon }]} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* FILTER + ACTION BAR */}
        {/* FILTER + ACTION BAR */}
        <div className="flex items-center flex-nowrap gap-2 mb-6 pb-4 border-b border-gray-200">
          {/* Filter inputs + filter buttons (đến từ CategoryFilter) */}
          <CategoryFilter
            value={filter}
            onChange={setFilter}
            onReset={handleReset}
            onSearch={handleSearch}
          />

          {/* Export / Add mới */}
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <PlusIcon className="w-5 h-5 mr-1" /> Xuất File
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="w-5 h-5 mr-1" /> Thêm mới
          </button>
        </div>



        {/* TABLE */}
        <CategoryTable
          categories={categories}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePage}
          onSortRecruit={() => { }}
        />
      </div>

      {/* MODAL */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={() => fetchCategories()}
      />
    </div>
  )
}

export default ManageCategoriesPage;
