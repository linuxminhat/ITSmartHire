import { IBackendRes, IJob, IModelPaginate, IApiResponse, IUser } from '@/types/backend';
import axios from '@/config/axios-customize';

export interface IApplication {
  _id: string;
  userId: Partial<IUser> | string;
  jobId: Partial<IJob> | string;
  cvUrl: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ICreateApplicationPayload {
  jobId: string;
  cvUrl: string;
}

interface ICreateApplicationRes extends IApiResponse {
  data?: {
    _id: string;
    createdAt: string;
  }
}

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

export const callUpdateApplicationStatus = (id: string, payload: IUpdateApplicationStatusPayload) => {
  return axios.patch<IApiResponse>(`/api/v1/applications/${id}/status`, payload);
}

export const callFetchAppliedJobs = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IApplication>>>(`/api/v1/applications/by-user?${query}`);
}

export const analyzeAndExportApplications = (jobId: string) => {
  return axios({
    method: 'post',
    url: `/api/v1/parsing-resumes/analyze-applications/${jobId}`,
    data: {},
    responseType: 'blob',
  });
}

