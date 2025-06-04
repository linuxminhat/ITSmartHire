import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CVScoringModalProps {
    onClose: () => void;
    onScore: (data: {
        jd: string;
        file: File;
        weights: {
            skills: number;
            experience: number;
            designation: number;
            degree: number;
            gpa: number;
            languages: number;
            awards: number;
            github: number;
            certifications: number;
            projects: number;
        }
    }) => void;
}

const CVScoringModal: React.FC<CVScoringModalProps> = ({ onClose, onScore }) => {
    const [jd, setJd] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [weights, setWeights] = useState({
        skills: 25,
        experience: 20,
        designation: 15,
        degree: 10,
        gpa: 10,
        languages: 10,
        awards: 2.5,
        github: 2.5,
        certifications: 2.5,
        projects: 2.5
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jd.trim() || !file) {
            alert('Vui lòng nhập JD và tải lên file Excel!');
            return;
        }
        onScore({
            jd: jd.trim(),
            file,
            weights
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const selectedFile = files[0];
            if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                alert('Vui lòng chọn file Excel (.xlsx)');
                return;
            }
            setFile(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium">Chấm điểm CV theo JD</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    {/* JD Input */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Job Description
                        </label>
                        <textarea
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            placeholder="Nhập JD công việc cần tuyển..."
                            className="w-full px-3 py-2 border rounded-lg h-32 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            File Excel CV đã trích xuất
                        </label>
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            className="w-full"
                            required
                        />
                    </div>

                    {/* Weights Section */}
                    <div className="mb-4">
                        <h4 className="font-bold mb-2">Trọng số chấm điểm</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(weights).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <label className="text-sm capitalize">
                                        {key === 'gpa' ? 'GPA' : key.replace(/_/g, ' ')}:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => setWeights(prev => ({
                                                ...prev,
                                                [key]: parseFloat(e.target.value)
                                            }))}
                                            className="w-16 px-2 py-1 border rounded"
                                            step="0.5"
                                            min="0"
                                            max="100"
                                        />
                                        <span>%</span>
                                    </div>
                                </div>
                            ))}
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
                            Chấm điểm CV
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CVScoringModal;
