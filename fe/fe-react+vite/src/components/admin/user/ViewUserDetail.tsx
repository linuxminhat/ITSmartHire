import React from 'react';
import { IUser } from '@/types/backend';
import { XMarkIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

interface ViewUserDetailProps {
  open: boolean;
  onClose: (v: boolean) => void;
  dataInit: IUser | null;
  setDataInit: (v: IUser | null) => void;
}

const ViewUserDetail: React.FC<ViewUserDetailProps> = ({ open, onClose, dataInit, setDataInit }) => {

  const handleClose = () => {
    setDataInit(null);
    onClose(false);
  }

  if (!dataInit) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Chi tiết Người dùng</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <DetailItem label="ID" value={dataInit._id} />
            <DetailItem label="Tên" value={dataInit.name} />
            <DetailItem label="Email" value={dataInit.email} />
            <DetailItem label="Tuổi" value={dataInit.age?.toString()} />
            <DetailItem label="Giới tính" value={dataInit.gender} />
            <DetailItem label="Địa chỉ" value={dataInit.address} />
            <DetailItem label="Vai trò" value={typeof dataInit.role === 'object' ? dataInit.role.name : dataInit.role} />
            {dataInit.company && (
                <DetailItem label="Công ty" value={typeof dataInit.company === 'object' ? dataInit.company.name : dataInit.company} />
            )}
            <DetailItem label="Ngày tạo" value={dayjs(dataInit.createdAt).format('DD/MM/YYYY HH:mm:ss')} />
            <DetailItem label="Cập nhật lần cuối" value={dayjs(dataInit.updatedAt).format('DD/MM/YYYY HH:mm:ss')} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
    label: string;
    value?: string | number | null;
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value ?? 'N/A'}</dd>
    </div>
);

export default ViewUserDetail;