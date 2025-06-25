import React from 'react';

export interface BlogFilterState {
  title: string;
  tag: string;
  isMine: boolean;
}

interface BlogFilterProps {
  isHr: boolean;
  value: BlogFilterState;
  onChange: (filter: BlogFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
}

const inputCls = 'px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-52 text-sm';

const BlogFilter: React.FC<BlogFilterProps> = ({ isHr, value, onChange, onSearch, onReset }) => {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  const update = (field: keyof BlogFilterState, v: string | boolean) =>
    onChange({ ...value, [field]: v });

  return (
    <div className="flex items-center gap-4">
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
      {isHr && (
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <input
            id="my-posts-filter"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            checked={value.isMine}
            onChange={e => update('isMine', e.target.checked)}
          />
          <label
            htmlFor="my-posts-filter"
            className="text-sm font-medium text-gray-700 select-none cursor-pointer"
          >
            Bài viết của tôi
          </label>
        </div>
      )}
    </div>
  );
};

export default BlogFilter; 