import axios from '../config/axios-customize';

// Định nghĩa các interface
export interface DashboardStats {
    totalUsers: number;
    totalRecruiters: number;
    totalJobs: number;
    activeJobs: number;
}

export interface TopSkill {
    _id: string;
    name: string;
    count: number;
}

export interface TopCompany {
    _id: string;
    name: string;
    jobCount: number;
}

export interface TopCategory {
    _id: string;
    name: string;
    count: number;
}

export interface UserGrowth {
    month: string;
    count: number;
}

// Các hàm gọi API

export const getDashboardStats = () =>
    axios
        .get<DashboardStats>('/api/v1/dashboard/stats')
        .then(res => res.data);

export const getTopSkills = () =>
    axios
        .get<TopSkill[]>('/api/v1/dashboard/top-skills')
        .then(res => res.data);

export const getTopCompanies = () =>
    axios
        .get<TopCompany[]>('/api/v1/dashboard/top-companies')
        .then(res => res.data);

export const getTopCategories = () =>
    axios
        .get<TopCategory[]>('/api/v1/dashboard/top-categories')
        .then(res => res.data);

export const getUserGrowth = () =>
    axios
        .get<UserGrowth[]>('/api/v1/dashboard/user-growth')
        .then(res => res.data);

export const dashboardService = {
    getDashboardStats,
    getTopSkills,
    getTopCompanies,
    getTopCategories,
    getUserGrowth,
};
