import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import SkillTable from '@/components/admin/skill/SkillTable';
import SkillModal from '@/components/admin/skill/SkillModal';
import SkillFilter, { SkillFilterState } from './SkillFilter';
import { callFetchSkill, callDeleteSkill } from '@/services/skill.service';
import { ISkill } from '@/types/backend';
import { toast } from 'react-toastify';
import { PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const ManageSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ current: 1, pageSize: 10, pages: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataInit, setDataInit] = useState<ISkill | null>(null);
  const [filter, setFilter] = useState<SkillFilterState>({ name: '', category: '' });

  const buildSkillQuery = (
    page = meta.current,
    size = meta.pageSize,
    f: SkillFilterState = filter,
  ) => {
    let q = `current=${page}&pageSize=${size}`;
    if (f.name.trim()) q += `&name=${encodeURIComponent(f.name.trim())}`;
    if (f.category.trim()) q += `&category=${encodeURIComponent(f.category.trim())}`;
    return q;
  };

  const fetchSkills = useCallback(async (query?: string) => {
    setIsLoading(true);
    const finalQuery = query ?? buildSkillQuery();

    try {
      const res = await callFetchSkill(finalQuery);
      if (res && res.data) {
        setSkills(res.data.result);
        setMeta(res.data.meta);
        return res.data.result.length;
      }
      toast.error(res?.message || 'Không thể tải danh sách kỹ năng.');
    } catch (err: any) {
      console.error('Fetch Skills Error:', err);
      toast.error(err.message || 'Đã có lỗi xảy ra khi tải dữ liệu kỹ năng.');
    } finally {
      setIsLoading(false);
    }
  }, [meta.current, meta.pageSize, filter]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleResetFilter = () => {
    const empty = { name: '', category: '' } as SkillFilterState;
    setFilter(empty);
    setMeta((m) => ({ ...m, current: 1 }));
    fetchSkills(buildSkillQuery(1, meta.pageSize, empty));
    toast.info('Đã làm mới trang');
  };

  const handleSearch = async () => {
    setMeta((m) => ({ ...m, current: 1 }));
    const count = await fetchSkills(buildSkillQuery(1, meta.pageSize));
    toast.success(`Tìm thấy ${count} kỹ năng`);
  };

  const handleAddNew = () => {
    setDataInit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (skill: ISkill) => {
    setDataInit(skill);
    setIsModalOpen(true);
  };

  const handleDelete = async (skill: ISkill) => {
    if (!skill._id) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa kỹ năng "${skill.name}" không?`)) return;

    setIsLoading(true);
    try {
      const res = await callDeleteSkill(skill._id);
      if (res?.data !== undefined || res?.status) {
        toast.success('Xóa kỹ năng thành công!');
        const tgtPage = meta.current > 1 && skills.length === 1 ? meta.current - 1 : meta.current;
        fetchSkills(buildSkillQuery(tgtPage, meta.pageSize));
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi xóa kỹ năng.');
      }
    } catch (err: any) {
      console.error('Delete Skill Error:', err);
      toast.error(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newSize = pageSize || meta.pageSize;
    setMeta((m) => ({ ...m, current: page, pageSize: newSize }));
    fetchSkills(buildSkillQuery(page, newSize));
  };

  const handleExportExcel = () => {
    if (!skills.length) return toast.info('Không có dữ liệu để xuất');

    const data = skills.map((s, idx) => ({
      STT: (meta.current - 1) * meta.pageSize + idx + 1,
      'Tên kỹ năng': s.name,
      'Bộ kỹ năng': s.category,
      'Lượt tuyển': s.recruitCount ?? 0,
      'Ngày tạo': dayjs(s.createdAt).format('DD/MM/YYYY'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skills');

    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([blob], { type: 'application/octet-stream' }), `skills_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);

    toast.success(`Đã xuất ${data.length} dòng ra Excel`);
  };

  const breadcrumbItems = [{ label: 'Quản lý Kỹ năng', icon: AcademicCapIcon }];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* FILTER + ACTION BAR */}
        <div className="flex items-start mb-6 pb-4 border-b border-gray-200 gap-4 flex-wrap">
          <SkillFilter value={filter} onChange={setFilter} onReset={handleResetFilter} onSearch={handleSearch} />

          {/* EXPORT */}
          <button
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Xuất File
          </button>

          {/* ADD NEW */}
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Thêm mới
          </button>
        </div>

        <SkillTable
          skills={skills}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handleTableChange}
          onSortRecruit={() => { }}
        />
      </div>

      <SkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataInit={dataInit}
        refetch={fetchSkills}
      />
    </div>
  );
};

export default ManageSkillsPage;
