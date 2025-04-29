import { IBackendRes, IResume, IModelPaginate } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 *
Module Resume
 */
export const callCreateResume = (url: string, companyId: any, jobId: any) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', { url, companyId, jobId })
}

export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.patch<IBackendRes<IResume>>(`/api/v1/resumes/${id}`, { status })
}

export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}

export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IResume[]>>(`/api/v1/resumes/by-user`);
} 