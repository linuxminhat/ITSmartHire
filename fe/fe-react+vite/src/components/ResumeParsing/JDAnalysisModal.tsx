import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface JDAnalysisModalProps {
    onClose: () => void;
    onAnalyze: (jd: string) => void;
}

const JDAnalysisModal: React.FC<JDAnalysisModalProps> = ({ onClose, onAnalyze }) => {
    const [jd, setJd] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (jd.trim()) {
            onAnalyze(jd.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-2/3 max-w-3xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium">Phân tích CV theo Job Description</h3>
                    <button onClick={onClose}>
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Nhập Job Description
                        </label>
                        <textarea
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            placeholder="Paste JD vào đây..."
                            className="w-full px-3 py-2 border rounded-lg h-64 
                                focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
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
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg 
                                hover:bg-purple-600"
                        >
                            Phân tích
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JDAnalysisModal;
