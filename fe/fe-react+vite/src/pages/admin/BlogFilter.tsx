import React, { useState, useEffect } from 'react';

export interface BlogFilterState {
  title: string;
  tag: string;
}

interface BlogFilterProps {
  value: BlogFilterState;
  onChange: (filter: BlogFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
}

const inputCls = 'px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-52 text-sm';

const BlogFilter: React.FC<BlogFilterProps> = ({ value, onChange, onSearch, onReset }) => {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  const update = (field: keyof BlogFilterState, v: string) =>
    onChange({ ...value, [field]: v });

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 mr-2">
        {/* Tên bài viết */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Tên bài viết:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm theo tên bài viết"
            value={value.title}
            onChange={e => update('title', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-sm">Tags:</span>
          <input
            type="text"
            className={inputCls}
            placeholder="Tìm theo tên tags"
            value={value.tag}
            onChange={e => update('tag', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogFilter; 