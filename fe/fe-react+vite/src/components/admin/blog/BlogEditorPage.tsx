// src/pages/admin/blog/BlogEditorPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogService } from '@/services/blog.service'
import BlogForm from '@/components/admin/blog/BlogForm'
import type { IBlog, IBlogPayload } from '@/types/blog.type'
import Spinner from '@/components/Spinner'

const BlogEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Dữ liệu ban đầu (chỉ dùng khi đang edit)
    const [initialData, setInitialData] = useState<IBlog | undefined>(undefined)
    const [loading, setLoading] = useState(!!id)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) {
            // thêm mới thì không cần load
            return setLoading(false)
        }

        // load blog cũ
        blogService
            .getById(id)
            .then((res) => setInitialData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    // ==== CHỈ ĐỔI Ở ĐÂY ====
    // Trước: data: Omit<IBlog,'_id'|'views'>
    // Sau:
    const handleSave = async (data: IBlogPayload) => {
        setSubmitting(true)
        try {
            if (id) {
                // cập nhật
                await blogService.update(id, data)
            } else {
                // tạo mới
                await blogService.create(data)
            }
            // sau khi thành công, quay về list
            navigate('/admin/blogs')
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }
    // ==========================

    if (loading) return <Spinner />

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold mb-6">
                {id ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h1>
            <div className="bg-white p-6 rounded shadow">
                <BlogForm
                    initialData={initialData}
                    onSubmit={handleSave}
                    submitting={submitting}
                />
            </div>
        </div>
    )
}

export default BlogEditorPage
