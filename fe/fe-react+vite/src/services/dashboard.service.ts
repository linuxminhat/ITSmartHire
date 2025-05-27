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
const getDashboardStats = () => {
    return axios.get<DashboardStats>('/dashboard/stats');
};

const getTopSkills = () => {
    return axios.get<TopSkill[]>('/dashboard/top-skills');
};

const getTopCompanies = () => {
    return axios.get<TopCompany[]>('/dashboard/top-companies');
};

const getTopCategories = () => {
    return axios.get<TopCategory[]>('/dashboard/top-categories');
};

const getUserGrowth = () => {
    return axios.get<UserGrowth[]>('/dashboard/user-growth');
};

export const dashboardService = {
    getDashboardStats,
    getTopSkills,
    getTopCompanies,
    getTopCategories,
    getUserGrowth,
};