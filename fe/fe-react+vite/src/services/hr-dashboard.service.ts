import axios from '@/config/axios-customize';
import { IApiResponse } from '@/types/backend';

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

export const hrDashboardService = {
  getStats: async () => {
    const res = await axios.get<HrDashboardStats>('/api/v1/hr-dashboard/stats');
    return res.data;
  },
  getTopPositions: async () => {
    const res = await axios.get<TopPosition[]>('/api/v1/hr-dashboard/top-positions');
    return res.data;
  },
  getApplicationStatus: async () => {
    const res = await axios.get<ApplicationStatusDistribution[]>('/api/v1/hr-dashboard/application-status');
    return res.data;
  },
  getJobGrowth: async () => {
    const res = await axios.get<MonthlyGrowth[]>('/api/v1/hr-dashboard/job-growth');
    return res.data;
  },
  getInterviewGrowth: async () => {
    const res = await axios.get<MonthlyGrowth[]>('/api/v1/hr-dashboard/interview-growth');
    return res.data;
  },
};
