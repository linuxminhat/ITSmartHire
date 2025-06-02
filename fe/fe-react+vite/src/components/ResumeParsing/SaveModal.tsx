import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SaveModalProps {
    onClose: () => void;
    onSave: (name: string, format: 'excel' | 'csv') => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [format, setFormat] = useState<'excel' | 'csv'>('excel');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), format);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium">Lưu danh sách CV</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Tên danh sách
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Hồ sơ ứng viên nộp backend"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Định dạng xuất
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="excel"
                                    checked={format === 'excel'}
                                    onChange={(e) => setFormat(e.target.value as 'excel' | 'csv')}
                                    className="mr-2"
                                />
                                Excel
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="csv"
                                    checked={format === 'csv'}
                                    onChange={(e) => setFormat(e.target.value as 'excel' | 'csv')}
                                    className="mr-2"
                                />
                                CSV
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveModal;
