import React, { useCallback } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

export interface JobFilterState {
  name: string;
  category: string;
  skill: string;
  company: string;
  location: string;
}

interface JobFilterProps {
  value: JobFilterState;
  onChange: (value: JobFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
}

const JobFilter: React.FC<JobFilterProps> = ({
  value,
  onChange,
  onSearch,
  onReset,
}) => {
  // Debounced search function with shorter delay
  const debouncedSearch = useCallback(
    debounce(() => {
      console.log('Debounced search triggered with value:', value);
      onSearch();
    }, 300),
    [onSearch, value]
  );

  const handleChange = (field: keyof JobFilterState, val: string) => {
    const newValue = { ...value, [field]: val };
    onChange(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const inputCls = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Tên việc làm */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Tên việc:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm việc"
            value={value.name}
            onChange={e => handleChange('name', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Danh mục */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Danh mục:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm danh mục"
            value={value.category}
            onChange={e => handleChange('category', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Kỹ năng */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Kỹ năng:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm kỹ năng"
            value={value.skill}
            onChange={e => handleChange('skill', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Công ty */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Công ty:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm công ty"
            value={value.company}
            onChange={e => handleChange('company', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Địa điểm */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Địa điểm:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm địa điểm"
            value={value.location}
            onChange={e => handleChange('location', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Làm mới
        </button>
        <button
          onClick={onSearch}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default JobFilter; 