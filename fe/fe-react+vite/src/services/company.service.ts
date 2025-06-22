import { IBackendRes, ICompany, IModelPaginate } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 *
Module Company
 */
export const callCreateCompany = (payload: Partial<ICompany>) => {
    return axios.post<IBackendRes<ICompany>>('/api/v1/companies', payload);
}

export const callUpdateCompany = (id: string, payload: Partial<ICompany>) => {
    return axios.patch<IBackendRes<ICompany>>(`/api/v1/companies/${id}`, payload);
}

export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
}

export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompanyPublic = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies/public?${query}`);
} 