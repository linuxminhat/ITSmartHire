// src/components/shared/TableFilter.tsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const inputCls =
    'h-10 w-44 border rounded px-3 text-sm focus:outline-none focus:ring focus:border-indigo-300';

/* ==== 1. Kiểu state mới ==== */
export interface FilterState {
    name: string;
    email: string;
    role: string;
}

interface TableFilterProps {
    value: FilterState;
    onChange: (state: FilterState) => void;
    onReset: () => void;
    onSearch: () => void;
}

const TableFilter: React.FC<TableFilterProps> = ({
    value,
    onChange,
    onReset,
    onSearch,
}) => (
    <div className="flex flex-wrap gap-4 mb-4">
        {/* ------------- Name ------------- */}
        <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Tên :</label>
            <input
                type="text"
                value={value.name}
                onChange={e => onChange({ ...value, name: e.target.value })}
                className={inputCls}
                placeholder="Tìm theo tên"
            />
        </div>

        {/* ------------- Email ------------- */}
        <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Email :</label>
            <input
                type="text"
                value={value.email}
                onChange={e => onChange({ ...value, email: e.target.value })}
                className={inputCls}
                placeholder="Tìm theo email"
            />
        </div>

        {/* ------------- Role ------------- */}
        <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Vai trò :</label>
            <input
                type="text"
                value={value.role}
                onChange={e => onChange({ ...value, role: e.target.value })}
                className={inputCls}
                placeholder="ADMIN / USER / HR…"
            />
        </div>

        {/* ---------- Buttons ---------- */}
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

export default TableFilter;
