import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { callUpdateDesignation } from '@/services/user.service';

interface UpdateDesignationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDesignation?: string;
    onSuccess: (newDesignation: string) => void;
}

const UpdateDesignationModal: React.FC<UpdateDesignationModalProps> = ({
    isOpen,
    onClose,
    currentDesignation = '',
    onSuccess
}) => {
    const [designation, setDesignation] = useState(currentDesignation);
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setDesignation(currentDesignation);
        }
    }, [isOpen, currentDesignation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!designation.trim()) {
            toast.error('Vui lòng nhập chức danh');
            return;
        }

        setIsLoading(true);
        try {
            const res = await callUpdateDesignation({ designation: designation.trim() });
            if (res && res.data) {
                toast.success('Cập nhật chức danh thành công!');
                onSuccess(designation.trim());
                onClose();
            }
        } catch (error) {
            console.error('Update designation error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật chức danh');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setDesignation(currentDesignation);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Cập nhật chức danh</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                            Chức danh của bạn
                        </label>
                        <input
                            type="text"
                            id="designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Ví dụ: Frontend Developer, Project Manager, ..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                'Cập nhật'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateDesignationModal;