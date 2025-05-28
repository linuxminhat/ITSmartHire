import React, { useRef, useState, useEffect } from 'react'
import type { IBlog, IBlogPayload } from '@/types/blog.type'
import { uploadFile } from '@/services/storage.service'
import { CloudArrowUpIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline'
import Select from 'react-select'
import { Editor } from '@tinymce/tinymce-react'

export interface BlogFormProps {
    initialData?: IBlog
    onSubmit: (data: IBlogPayload) => void
    submitting: boolean
}

const TAG_OPTIONS = [
    'Sự nghiệp IT',
    'Ứng tuyển và thăng tiến',
    'Chuyên môn IT',
    'Chuyện IT',
    'Quảng bá công ty',
]
const tagOptions = TAG_OPTIONS.map(tag => ({ value: tag, label: tag }))

const BlogForm: React.FC<BlogFormProps> = ({ initialData, onSubmit, submitting }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState<IBlogPayload>({
        title: '',
        description: '',
        content: '',
        thumbnail: '',
        status: 'draft' as 'draft' | 'published',
        tags: [] as string[],
    })
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                content: initialData.content,
                thumbnail: initialData.thumbnail || '',
                status: initialData.status as 'draft' | 'published',
                tags: initialData.tags || [],
            })
        }
    }, [initialData])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const url = await uploadFile(file, 'blog-thumbnails', p => setProgress(p))
            setFormData(prev => ({ ...prev, thumbnail: url }))
        } catch (err) {
            console.error(err)
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Debug tạm thời
        console.log('Submitting form data:', formData);
        console.log('Tags being submitted:', formData.tags);
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <div className="relative">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tiêu đề..."
                        className="w-full border-b-2 border-orange-500 focus:outline-none px-2 py-1 pr-10"
                        required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-2">
                        <CloudArrowUpIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <div className="relative">
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Nhập mô tả..."
                        className="w-full border-b-2 border-gray-300 focus:outline-none px-2 py-1 pr-10"
                        required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <CloudArrowUpIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Ảnh đại diện</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <div
                        onClick={handleImageClick}
                        className="cursor-pointer border-2 border-dashed rounded-lg h-32 flex items-center justify-center hover:border-blue-500"
                    >
                        {formData.thumbnail ? (
                            <img src={formData.thumbnail} alt="Thumb" className="max-h-28" />
                        ) : (
                            <PlusIcon className="h-8 w-8 text-gray-400" />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="draft">Nháp</option>
                        <option value="published">Đăng</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tags</label>
                    <Select
                        options={tagOptions}
                        isMulti
                        isSearchable
                        closeMenuOnSelect={false}
                        placeholder="Chọn tag..."
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            menuList: base => ({
                                ...base,
                                maxHeight: '150px',
                            }),
                        }}
                        value={tagOptions.filter(option => formData.tags.includes(option.value))}
                        onChange={(selectedOptions) => {
                            const selectedTags = selectedOptions ? (selectedOptions as {value: string, label: string}[]).map(option => option.value) : [];
                            setFormData(prev => ({ ...prev, tags: selectedTags }));
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Chọn ít nhất một tag phù hợp với nội dung bài viết</p>
                </div>
            </div>
            <Editor
                apiKey="nxdd2bqfluksusq6r978zthgxs1fy7u37qyu343ew2r05qiq"
                value={formData.content}
                init={{
                    height: 500,
                    menubar: 'file edit view insert format tools table help',
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount',
                        'imagetools'
                    ],
                    toolbar: 'undo redo | formatselect | ' +
                        'bold italic underline | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'image link | table | code',
                    automatic_uploads: true,
                    images_reuse_filename: true,
                    images_upload_handler: function (blobInfo, progress) {
                        return new Promise((resolve, reject) => {
                            const file = new File([blobInfo.blob()], blobInfo.filename());

                            uploadFile(file, 'blog-images', (p) => {
                                progress(p);
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
                    image_title: true,
                    image_caption: true,

                    font_formats:
                        'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier;' +
                        'Georgia=georgia,palatino;Tahoma=tahoma,arial,helvetica,sans-serif;' +
                        'Times New Roman=times new roman,times;Verdana=verdana,geneva;',
                    fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',

                    file_picker_callback: function (callback, value, meta) {
                        if (meta.filetype === 'image') {
                            const input = document.createElement('input');
                            input.setAttribute('type', 'file');
                            input.setAttribute('accept', 'image/*');

                            input.onchange = function () {
                                if (input.files?.[0]) {
                                    const file = input.files[0];
                                    const uploadingText = `Đang tải lên ${file.name}...`;
                                    callback(uploadingText, { title: file.name });

                                    uploadFile(file, 'blog-images', (p) => {
                                    })
                                        .then(url => {
                                            callback(url, { title: file.name });
                                        })
                                        .catch(err => {
                                            console.error('Lỗi upload ảnh:', err);
                                            callback('', { title: 'Upload thất bại' });
                                        });
                                }
                            };

                            input.click();
                        }
                    }
                }}
                onEditorChange={content => setFormData(prev => ({ ...prev, content }))}
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {submitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Tạo mới'}
                </button>
            </div>
        </form>
    )
}

export default BlogForm
