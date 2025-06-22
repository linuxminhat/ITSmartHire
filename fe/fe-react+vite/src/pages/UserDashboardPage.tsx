import React, { useState, useEffect } from 'react';
import UserDashboardSidebar from '@/layouts/components/UserDashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircleIcon, EnvelopeIcon, PencilSquareIcon, DocumentCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Spinner from '@/components/Spinner';
import { callGetAttachedCvs, callGetUserProfile } from '@/services/user.service';
import { IAttachedCv } from '@/types/backend';
import { toast } from 'react-toastify';
import UpdateDesignationModal from '@/components/UpdateDesignationModal';

const UserDashboardPage: React.FC = () => {
  const { user, isLoading, setUser } = useAuth();
  const [attachedCvs, setAttachedCvs] = useState<IAttachedCv[]>([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState<boolean>(false);
  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);

  // Fetch attached CVs on mount
  useEffect(() => {
    const fetchAttachedCvs = async () => {
      if (!user) return;

      setIsLoadingCvs(true);
      try {
        const res = await callGetAttachedCvs();
        if (res && res.data) {
          setAttachedCvs(res.data);
        }
      } catch (err) {
        console.error("Fetch Attached CVs Error:", err);
      } finally {
        setIsLoadingCvs(false);
      }
    };

    fetchAttachedCvs();
  }, [user]);

  // Handler for designation update success
  const handleDesignationUpdateSuccess = async (newDesignation: string) => {
    try {
      // Fetch updated user profile from server
      const res = await callGetUserProfile();
      if (res && res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // Fallback: update only designation field locally
      if (user) {
        setUser({
          ...user,
          designation: newDesignation
        });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-gray-500">Vui lòng đăng nhập để xem trang này.</div>;
  }

  const AttachedResumesSection = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Hồ sơ đính kèm của bạn</h2>
      </div>

      {isLoadingCvs ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : attachedCvs.length > 0 ? (
        <div className="space-y-2">
          {attachedCvs.slice(0, 3).map((cv) => (
            <div key={cv._id} className="flex items-center p-3 border border-gray-200 rounded-md bg-gray-50">
              <DocumentCheckIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-gray-800 font-medium truncate">{cv.name}</span>
            </div>
          ))}
          {attachedCvs.length > 3 && (
            <div className="text-sm text-gray-500 text-center pt-1">
              +{attachedCvs.length - 3} CV khác
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-md p-6 text-center text-gray-500">
          <p>Chưa có hồ sơ nào được đính kèm.</p>
          <Link
            to="/user/attached-cvs"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            Quản lý hồ sơ đính kèm
          </Link>
        </div>
      )}
    </div>
  );

  const RecentActivitySection = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động của bạn</h2>
      <p className="text-gray-500">Chưa có hoạt động gần đây.</p>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="md:col-span-1 lg:col-span-1">
            <UserDashboardSidebar user={user} />
          </div>

          <div className="md:col-span-3 lg:col-span-4 space-y-6 md:space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-16 w-16 text-gray-400" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h1>
                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start mb-1">
                  <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                  <span 
                    className="hover:text-indigo-600 cursor-pointer transition-colors"
                    onClick={() => setIsDesignationModalOpen(true)}
                  >
                    {user.designation || 'Cập nhật chức danh'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start">
                  <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                  {user.email}
                </p>
              </div>
            </div>

            <AttachedResumesSection />
            <RecentActivitySection />
          </div>
        </div>
      </div>

      {/* Update Designation Modal */}
      <UpdateDesignationModal
        isOpen={isDesignationModalOpen}
        onClose={() => setIsDesignationModalOpen(false)}
        currentDesignation={user.designation}
        onSuccess={handleDesignationUpdateSuccess}
      />
    </div>
  );
};

export default UserDashboardPage; 