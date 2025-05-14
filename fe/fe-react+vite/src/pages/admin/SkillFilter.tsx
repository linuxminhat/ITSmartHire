// src/components/shared/SkillFilter.tsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const inputCls =
    'h-10 w-44 border rounded px-3 text-sm focus:outline-none focus:ring focus:border-indigo-300';

export interface SkillFilterState {
    name: string;
    category: string;
}

interface SkillFilterProps {
    value: SkillFilterState;
    onChange: (state: SkillFilterState) => void;
    onReset: () => void;
    onSearch: () => void;
}

const SkillFilter: React.FC<SkillFilterProps> = ({ value, onChange, onReset, onSearch }) => (
    <div className="flex flex-wrap gap-4 mb-4">
        {/* Tên kỹ năng */}
        <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Tên kỹ năng :</label>
            <input
                type="text"
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                className={inputCls}
                placeholder="Tìm theo tên kỹ năng"
            />
        </div>

        {/* Bộ kỹ năng */}
        <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Bộ kỹ năng :</label>
            <input
                type="text"
                value={value.category}
                onChange={(e) => onChange({ ...value, category: e.target.value })}
                className={inputCls}
                placeholder="Tìm theo bộ kỹ năng"
            />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 ml-auto">
            <button
                type="button"
                onClick={onReset}
                className="flex items-center px-4 py-2 h-10 bg-white text-gray-700 border rounded-md shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Làm lại
            </button>

            <button
                type="button"
                onClick={onSearch}
                className="flex items-center px-4 py-2 h-10 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Tìm kiếm
            </button>
        </div>
    </div>
);

export default SkillFilter;
