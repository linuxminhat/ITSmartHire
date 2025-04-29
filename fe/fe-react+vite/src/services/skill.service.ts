import { IBackendRes, IModelPaginate, ISkill, IApiResponse, IBackendResWithResultArray } from '@/types/backend'; // Assuming ISkill is defined in backend types
import axios from '@/config/axios-customize';

/**
 *
Module Skill
 */
export const callCreateSkill = (payload: Partial<ISkill>) => {
    // Ensure Partial<ISkill> satisfies what the API expects (likely just 'name')
    return axios.post<IApiResponse>('/api/v1/skills', payload);
}

export const callUpdateSkill = (id: string, payload: Partial<ISkill>) => {
    // Ensure Partial<ISkill> satisfies what the API expects
    return axios.patch<IApiResponse>(`/api/v1/skills/${id}`, payload);
}

export const callDeleteSkill = (id: string) => {
    return axios.delete<IApiResponse>(`/api/v1/skills/${id}`);
}

export const callFetchSkill = (query: string) => {
    // Ensure ISkill is the correct return type structure
    return axios.get<IBackendRes<IModelPaginate<ISkill>>>(`/api/v1/skills?${query}`);
}

export const callFetchSkillById = (id: string) => {
    return axios.get<IBackendRes<ISkill>>(`/api/v1/skills/${id}`);
}

// Fetch all skills without pagination (adjust endpoint if needed)
export const callFetchAllSkills = () => {
    // Assuming the backend endpoint /api/v1/skills without pagination query returns all skills
    // The response should contain the array directly or within a standard wrapper.
    // Let's assume it returns IBackendRes<ISkill[]> for consistency
    return axios.get<IBackendRes<ISkill[]>>(`/api/v1/skills?current=1&pageSize=100`); // Fetch up to 100 skills, adjust if necessary
}; 