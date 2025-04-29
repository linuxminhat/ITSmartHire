import React from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from './components/UserHeader';
import UserFooter from './components/UserFooter';

const UserLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main >
        {/* Content of the specific page (HomePage, etc.) will render here */}
        <Outlet /> 
      </main>
      <UserFooter />
    </div>
  );
};

export default UserLayout; 