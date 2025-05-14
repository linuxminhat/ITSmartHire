// src/components/admin/category/CategoryFilter.tsx
import React from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

export interface CategoryFilterState {
    name: string
    skill: string
}

interface CategoryFilterProps {
    value: CategoryFilterState
    onChange: (s: CategoryFilterState) => void
    onReset: () => void
    onSearch: () => void
}

const inputCls =
    'h-10 border rounded px-3 text-sm focus:outline-none focus:ring focus:border-indigo-300'

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    value,
    onChange,
    onReset,
    onSearch,
}) => {
    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onSearch()
        }
    }

    return (
        <div className="flex flex-nowrap gap-2 items-center">
            {/* Tên danh mục */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tên danh mục :</label>
                <input
                    type="text"
                    className={inputCls}
                    placeholder="Tìm theo tên danh mục"
                    value={value.name}
                    onChange={e => onChange({ ...value, name: e.target.value })}
                    onKeyDown={onKey}
                />
            </div>

            {/* Bộ kỹ năng */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Bộ kỹ năng :</label>
                <input
                    type="text"
                    className={inputCls}
                    placeholder="Tìm theo bộ kỹ năng"
                    value={value.skill}
                    onChange={e => onChange({ ...value, skill: e.target.value })}
                    onKeyDown={onKey}
                />
            </div>

            {/* Nút Làm lại */}
            <button
                type="button"
                onClick={onReset}
                className="flex items-center px-4 py-2 h-10 bg-white border rounded-md shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Làm lại
            </button>

            {/* Nút Tìm kiếm */}
            <button
                type="button"
                onClick={onSearch}
                className="flex items-center px-4 py-2 h-10 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Tìm kiếm
            </button>
        </div>
    )
}

export default CategoryFilter
