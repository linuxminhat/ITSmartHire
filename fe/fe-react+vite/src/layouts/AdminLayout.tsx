// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Header from './components/Header';
// import Sidebar from './components/Sidebar';

// const AdminLayout: React.FC = () => {
//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header />
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
//           <Outlet /> 
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout; 
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

import { HRNotificationProvider } from '@/contexts/HRNotificationContext';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();              // lấy thông tin role
  const isHR = user?.role?.name === 'HR';

  const MainContent = (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );

  // Nếu HR → bọc provider, ngược lại trả content như cũ
  return isHR ? (
    <HRNotificationProvider>{MainContent}</HRNotificationProvider>
  ) : (
    MainContent
  );
};

export default AdminLayout;
