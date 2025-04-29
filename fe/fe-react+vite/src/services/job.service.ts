import { IBackendRes, IJob, IModelPaginate, IApiResponse, IBackendResWithResultArray } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 *
Module Job
 */
export const callCreateJob = (payload: Partial<IJob>) => {
    // Removed logic that extracted company ID. Send payload directly as DTO requires the object.
    // const dataToSend = {
    //     ...payload,
    //     company: typeof payload.company === 'object' ? payload.company._id : payload.company
    // };
    return axios.post<IApiResponse>('/api/v1/jobs', payload); // Send payload directly
}

export const callUpdateJob = (id: string, payload: Partial<IJob>) => {
    // Removed logic that extracted company ID. Send payload directly as DTO requires the object.
    // const dataToSend = {
    //     ...payload,
    //     company: typeof payload.company === 'object' ? payload.company._id : payload.company
    // };
    return axios.patch<IApiResponse>(`/api/v1/jobs/${id}`, payload); // Send payload directly
}

export const callDeleteJob = (id: string) => {
    // Assuming delete also returns a simple response, adjust if needed
    return axios.delete<IApiResponse>(`/api/v1/jobs/${id}`);
}

export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
};

//Finding Job
export const callFetchJobByCompany = (companyId: string) => {
    // Update return type to match the backend response structure {statusCode, message, result: IJob[]}
    return axios.get<IBackendResWithResultArray<IJob>>(`/api/v1/jobs/by-company/${companyId}`); // Use the correct endpoint
};

// Fetch Similar Jobs
export const callFetchSimilarJobs = (jobId: string, limit: number = 5) => {
    // Backend returns an array of jobs directly (IBackendRes<IJob[]>)
    return axios.get<IBackendRes<IJob[]>>(`/api/v1/jobs/${jobId}/similar?limit=${limit}`);
};

// Fetch Jobs by Skills
export const callFetchJobsBySkills = (skillIds: string[], currentPage: number = 1, pageSize: number = 10) => {
    const payload = { skills: skillIds };
    const query = `current=${currentPage}&pageSize=${pageSize}`;
    // Call the POST endpoint with skills in the body and pagination in the query
    return axios.post<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/by-skills?${query}`, payload);
};

// Fetch Jobs by Category
export const callFetchJobsByCategory = (categoryId: string, currentPage: number = 1, pageSize: number = 10) => {
    const query = `current=${currentPage}&pageSize=${pageSize}`;
    // Call the GET endpoint with categoryId in the path and pagination in the query
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/by-category/${categoryId}?${query}`);
};

// Search Jobs by Name and/or Location
export const callSearchJobs = (name?: string, location?: string, currentPage: number = 1, pageSize: number = 10) => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.set('name', name);
    if (location) queryParams.set('location', location);
    queryParams.set('current', currentPage.toString());
    queryParams.set('pageSize', pageSize.toString());

    // Call the GET endpoint with search parameters
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/search?${queryParams.toString()}`);
}; 