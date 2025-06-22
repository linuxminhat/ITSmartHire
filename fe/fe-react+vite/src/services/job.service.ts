import { IBackendRes, IJob, IModelPaginate, IApiResponse, IBackendResWithResultArray } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 *
Module Job
 */
export const callCreateJob = (payload: Partial<IJob>) => {
    return axios.post<IApiResponse>('/api/v1/jobs', payload);
}

export const callUpdateJob = (id: string, payload: Partial<IJob>) => {
    return axios.patch<IApiResponse>(`/api/v1/jobs/${id}`, payload);
}

export const callDeleteJob = (id: string) => {
    return axios.delete<IApiResponse>(`/api/v1/jobs/${id}`);
}

export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
};

export const callFetchJobByCompany = (companyId: string) => {
    return axios.get<IBackendResWithResultArray<IJob>>(`/api/v1/jobs/by-company/${companyId}`);
};

// Fetch Similar Jobs
export const callFetchSimilarJobs = (jobId: string, limit: number = 5) => {
    return axios.get<IBackendRes<IJob[]>>(`/api/v1/jobs/${jobId}/similar?limit=${limit}`);
};

// Fetch Jobs by Skills
export const callFetchJobsBySkills = (skillIds: string[], currentPage: number = 1, pageSize: number = 10) => {
    const payload = { skills: skillIds };
    const query = `current=${currentPage}&pageSize=${pageSize}`;
    return axios.post<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/by-skills?${query}`, payload);
};

// Fetch Jobs by Category
export const callFetchJobsByCategory = (categoryId: string, currentPage: number = 1, pageSize: number = 10) => {
    const query = `current=${currentPage}&pageSize=${pageSize}`;
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/by-category/${categoryId}?${query}`);
};

// Search Jobs by Name and/or Location
export const callSearchJobs = (name?: string, location?: string, currentPage: number = 1, pageSize: number = 10) => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.set('name', name);
    if (location) queryParams.set('location', location);
    queryParams.set('current', currentPage.toString());
    queryParams.set('pageSize', pageSize.toString());
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/search?${queryParams.toString()}`);
};

// Thêm function mới cho public
export const callFetchJobPublic = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/public?${query}`);
} 