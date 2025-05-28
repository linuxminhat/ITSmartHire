import React from 'react'

export interface CompanyFilterState {
  name: string
  address: string
  country: string
  industry: string
}

interface CompanyFilterProps {
  value: CompanyFilterState
  onChange: (filter: CompanyFilterState) => void
  onSearch: () => void
  onReset: () => void
}

const inputCls =
  'px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 text-sm'

const CompanyFilter: React.FC<CompanyFilterProps> = ({
  value,
  onChange,
  onSearch,
  onReset,
}) => {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch()
  }

  const update = (field: keyof CompanyFilterState, v: string) =>
    onChange({ ...value, [field]: v })

  return (
    <div className="flex items-center gap-2">
      {/* Tên công ty */}
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap text-sm">Tên công ty:</span>
        <input
          className={inputCls}
          placeholder="Tìm theo tên công ty"
          value={value.name}
          onChange={e => update('name', e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>

      {/* Địa chỉ */}
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap text-sm">Địa chỉ:</span>
        <input
          className={inputCls}
          placeholder="Tìm theo địa chỉ"
          value={value.address}
          onChange={e => update('address', e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>

      {/* Quốc gia */}
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap text-sm">Quốc gia:</span>
        <input
          className={inputCls}
          placeholder="Tìm theo quốc gia"
          value={value.country}
          onChange={e => update('country', e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>

      {/* Lĩnh vực */}
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap text-sm">Lĩnh vực:</span>
        <input
          className={inputCls}
          placeholder="Tìm theo lĩnh vực"
          value={value.industry}
          onChange={e => update('industry', e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}

export default CompanyFilter
