import { IBackendRes, IJob, IModelPaginate, IApiResponse, IUser } from '@/types/backend';
import axios from '@/config/axios-customize';

// Define the application structure returned by the backend
export interface IApplication {
    _id: string;
    userId: Partial<IUser> | string; // Populated with user info (_id, name, email)
    jobId: Partial<IJob> | string; // Could be populated if needed
    cvUrl: string;
    status: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    // Add other fields if returned by backend
  }

// Define the expected payload for creating an application
interface ICreateApplicationPayload {
  jobId: string;
  cvUrl: string;
}

// Define the expected response structure for creating an application
interface ICreateApplicationRes extends IApiResponse {
  data?: { // Assuming backend wraps result in 'data'
      _id: string;
      createdAt: string;
  }
}

// Define payload for updating status
interface IUpdateApplicationStatusPayload {
  status: string;
}

/**
 *
Module Applications
 */
export const callApplyJob = (payload: ICreateApplicationPayload) => {
    return axios.post<ICreateApplicationRes>('/api/v1/applications', payload);
}

// Fetch applications for a specific job
export const callFetchApplicationsByJob = (jobId: string, query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IApplication>>>(`/api/v1/applications/by-job/${jobId}?${query}`);
}

// Update application status
export const callUpdateApplicationStatus = (id: string, payload: IUpdateApplicationStatusPayload) => {
    // Assuming the backend returns a simple success message or the updated application
    return axios.patch<IApiResponse>(`/api/v1/applications/${id}/status`, payload);
}

// Fetch jobs applied by the current user
export const callFetchAppliedJobs = (query: string) => {
    // IApplication already includes populated job details based on backend service
    return axios.get<IBackendRes<IModelPaginate<IApplication>>>(`/api/v1/applications/by-user?${query}`);
}

// Add other application related service calls here later (e.g., fetch user applications) 