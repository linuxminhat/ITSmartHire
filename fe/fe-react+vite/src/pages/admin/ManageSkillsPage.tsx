import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import SkillTable from '@/components/admin/skill/SkillTable';
import SkillModal from '@/components/admin/skill/SkillModal';
import { callFetchSkill, callDeleteSkill } from '@/services/skill.service';
import { ISkill } from '@/types/backend';
import { toast } from 'react-toastify';
import { PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const ManageSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{ current: number; pageSize: number; pages: number; total: number }>({ current: 1, pageSize: 10, pages: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<ISkill | null>(null);

  const fetchSkills = useCallback(async (query?: string) => {
    setIsLoading(true);
    const defaultQuery = `current=${meta.current}&pageSize=${meta.pageSize}`;
    const finalQuery = query ? query : defaultQuery;

    try {
      const res = await callFetchSkill(finalQuery);
      if (res && res.data) {
        setSkills(res.data.result);
        setMeta(res.data.meta);
      } else {
        toast.error(res.message || "Không thể tải danh sách kỹ năng.");
      }
    } catch (error: any) {
      console.error("Fetch Skills Error:", error);
      toast.error(error.message || "Đã có lỗi xảy ra khi tải dữ liệu kỹ năng.");
    } finally {
      setIsLoading(false);
    }
  }, [meta.current, meta.pageSize]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

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
      if (res && res.data) {
        toast.success('Xóa kỹ năng thành công!');
        const query = meta.current > 1 && skills.length === 1 ? `current=${meta.current - 1}&pageSize=${meta.pageSize}` : `current=${meta.current}&pageSize=${meta.pageSize}`;
        fetchSkills(query);
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi xóa kỹ năng.');
      }
    } catch (error: any) {
      console.error("Delete Skill Error:", error);
      toast.error(error.message || 'Đã có lỗi xảy ra khi xóa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || meta.pageSize;
    setMeta(prevMeta => ({ ...prevMeta, current: page, pageSize: newPageSize }));
    fetchSkills(`current=${page}&pageSize=${newPageSize}`);
  };

  const breadcrumbItems = [
    { label: 'Quản lý Kỹ năng', icon: AcademicCapIcon },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex-1">
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm mới
          </button>
        </div>

        <SkillTable
          skills={skills}
          meta={meta}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handleTableChange}
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