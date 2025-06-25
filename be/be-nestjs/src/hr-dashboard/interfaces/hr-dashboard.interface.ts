export interface HrDashboardStats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalInterviews: number;
}

export interface TopPosition {
    _id: string;
    name: string;
    count: number;
}

export interface ApplicationStatusDistribution {
    status: string;
    count: number;
}

export interface MonthlyGrowth {
    month: string;
    count: number;
}
