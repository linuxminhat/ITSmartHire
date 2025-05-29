import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';
import { FormValues } from '@/types/interview-event';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    defaultRange?: { start: Date; end: Date };
    defaultValues?: Partial<FormValues>;
    mode: 'create' | 'edit';
    onCreate?: (data: FormValues) => void;
    onUpdate?: (data: FormValues) => void;
    onDelete?: () => void;
}

const InterviewEventModal: React.FC<Props> = ({
    isOpen,
    onClose,
    defaultRange,
    defaultValues,
    mode,
    onCreate,
    onUpdate,
    onDelete,
}) => {
    const { register, handleSubmit } = useForm<FormValues>({ defaultValues });
    const submit = handleSubmit(values => {
        if (mode === 'create') onCreate?.(values);
        else onUpdate?.(values);
    });

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <>
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg relative">
                    {/* nút đóng */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        aria-label="Đóng"
                    >
                        ✕
                    </button>

                    <h3 className="text-xl font-semibold mb-4">
                        {mode === 'create'
                            ? 'Tạo lịch phòng vấn'
                            : 'Cập nhật lịch phòng vấn'}
                    </h3>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Tiêu đề */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                            <input
                                {...register('title', { required: true })}
                                placeholder="Nhập tiêu đề"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Email ứng viên */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Email ứng viên</label>
                            <input
                                type="email"
                                {...register('candidateEmail', { required: true })}
                                placeholder="Nhập email ứng viên"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Link Meet */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Link Meet</label>
                            <input
                                {...register('meetLink')}
                                placeholder="Nhập link Meet (nếu có)"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Ghi chú</label>
                            <textarea
                                {...register('note')}
                                placeholder="Nhập ghi chú (nếu cần)"
                                rows={3}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Thời gian */}
                        {defaultRange && (
                            <p className="text-sm text-gray-500">
                                {defaultRange.start.toLocaleString()} –{' '}
                                {defaultRange.end.toLocaleString()}
                            </p>
                        )}

                        {/* Nút hành động */}
                        <div className="flex justify-end gap-2">
                            {mode === 'edit' && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Xóa
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            >
                                Huỷ
                            </button>

                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>,
        document.body
    );
};

export default InterviewEventModal;
