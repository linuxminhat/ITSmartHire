import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import App from "@/App";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";
import AdminPage from "@/pages/admin/AdminPage";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthWrapper from "@/contexts/AuthWrapper";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/admin/ProfilePage";
import ManageCompaniesPage from "@/pages/admin/ManageCompaniesPage";
import ManageUsersPage from "@/pages/admin/ManageUsersPage";
import ManageRolesPage from "@/pages/admin/ManageRolesPage";
import ManageSkillsPage from "@/pages/admin/ManageSkillsPage";
import ManageCategoriesPage from "@/pages/admin/ManageCategoriesPage";
import ManageJobsPage from "@/pages/admin/ManageJobsPage";
import ManageResumesPage from "@/pages/admin/ManageResumesPage";
import ManageBlogsPage from "@/pages/admin/ManageBlogsPage";
import AllCompaniesPage from "@/pages/AllCompaniesPage";
import CompanyDetailsPage from "@/pages/CompanyDetailsPage";
import AllJobsPage from "@/pages/AllJobsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import UserDashboardPage from "@/pages/UserDashboardPage";
import UserProfilePage from "@/pages/UserProfilePage";
import AttachedResumesPage from '@/pages/AttachedResumesPage';
import JobsBySkillPage from '@/pages/JobsBySkillPage';
import JobsByCategoryPage from '@/pages/JobsByCategoryPage';
import JobSearchResultsPage from '@/pages/JobSearchResultsPage';
import AppliedJobsPage from "@/pages/AppliedJobsPage";
import BlogListPage from '@/pages/BlogListPage';
import BlogDetailPage from '@/pages/BlogDetailPage';

const Root = () => (
  <AuthProvider>
    <AuthWrapper>
      <App />
    </AuthWrapper>
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "companies", element: <AllCompaniesPage /> },
          { path: "company/:id", element: <CompanyDetailsPage /> },
          { path: "jobs", element: <AllJobsPage /> },
          { path: "job/:id", element: <JobDetailsPage /> },
          { path: "jobs/by-skill/:skillId", element: <JobsBySkillPage /> },
          { path: "jobs/by-category/:categoryId", element: <JobsByCategoryPage /> },
          { path: "jobs/search", element: <JobSearchResultsPage /> },
          { path: "jobs/applied", element: <AppliedJobsPage /> },
          { path: "dashboard", element: <UserDashboardPage /> },
          { path: "profile", element: <UserProfilePage /> },
          { path: "resumes/attached", element: <AttachedResumesPage /> },
          {
            path: "blog",
            element: <BlogListPage />,
          },
          {
            path: "blog/:id",
            element: <BlogDetailPage />,
          },
        ]
      },

      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminPage /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "companies", element: <ManageCompaniesPage /> },
              { path: "users", element: <ManageUsersPage /> },
              { path: "roles", element: <ManageRolesPage /> },
              { path: "skills", element: <ManageSkillsPage /> },
              { path: "categories", element: <ManageCategoriesPage /> },
              { path: "jobs", element: <ManageJobsPage /> },
              { path: "blogs", element: <ManageBlogsPage /> },
            ]
          }
        ]
      },

      {
        path: "hr",
        element: <ProtectedRoute allowedRoles={['HR']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/hr/jobs" replace /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "companies", element: <ManageCompaniesPage /> },
              { path: "jobs", element: <ManageJobsPage /> },
              { path: "resumes", element: <ManageResumesPage /> }
            ]
          }
        ]
      },
    ],
  },
]);