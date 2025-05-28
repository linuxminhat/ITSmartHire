import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogService } from '@/services/blog.service'
import BlogForm from '@/components/admin/blog/BlogForm'
import type { IBlog, IBlogPayload } from '@/types/blog.type'
import Spinner from '@/components/Spinner'

const BlogEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [initialData, setInitialData] = useState<IBlog | undefined>(undefined)
    const [loading, setLoading] = useState(!!id)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) {
            return setLoading(false)
        }
        blogService
            .getById(id)
            .then((res) => setInitialData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    const handleSave = async (data: IBlogPayload) => {
        setSubmitting(true)
        try {
            console.log('Data before sending to server:', data);

            const payload = {
                ...data,
                tags: Array.isArray(data.tags) ? data.tags : []
            };

            console.log('Final payload:', payload);

            if (id) {
                // cập nhật
                await blogService.update(id, payload)
            } else {
                // tạo mới
                await blogService.create(payload)
            }
            // sau khi thành công, quay về list
            navigate('/admin/blogs')
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }


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
