import { IBackendRes, IModelPaginate, ICategory, IApiResponse } from '@/types/backend'; // Use ICategory
import axios from '@/config/axios-customize';

/**
 *
Module Category
 */
export const callCreateCategory = (payload: Partial<ICategory>) => {
    return axios.post<IApiResponse>('/api/v1/categories', payload);
}

export const callUpdateCategory = (id: string, payload: Partial<ICategory>) => {
    return axios.patch<IApiResponse>(`/api/v1/categories/${id}`, payload);
}

export const callDeleteCategory = (id: string) => {
    return axios.delete<IApiResponse>(`/api/v1/categories/${id}`);
}

export const callFetchCategory = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(`/api/v1/categories?${query}`);
}

export const callFetchCategoryById = (id: string) => {
    return axios.get<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
}

// Fetch all categories without pagination
export const callFetchAllCategories = () => {

    return axios.get<IBackendRes<ICategory[]>>(`/api/v1/categories?current=1&pageSize=100`); // Fetch up to 100 categories
}; 