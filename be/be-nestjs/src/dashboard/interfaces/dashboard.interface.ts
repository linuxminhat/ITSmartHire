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