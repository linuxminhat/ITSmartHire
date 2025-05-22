
import axios from '@/config/axios-customize';
import { IApiResponse, IBackendRes, IModelPaginate } from '@/types/backend';

export interface IHRNotification {
    _id: string;
    hrId: string;
    applicationId: string;
    jobId: string;
    jobName: string;
    candidateName: string;
    candidateEmail: string;
    isRead: boolean;
    message: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export const fetchHRNotifications = (query: string) =>
    axios.get<IBackendRes<IModelPaginate<IHRNotification>>>(
        `/api/v1/hr-notifications?${query}`,
    );

export const markHRNotificationAsRead = (id: string) =>
    axios.patch<IApiResponse>(`/api/v1/hr-notifications/${id}/read`);

export const markAllHRNotificationsAsRead = () =>
    axios.patch<IApiResponse>(`/api/v1/hr-notifications/read-all`);

export const getUnreadHRNotificationCount = () =>
    axios.get<IBackendRes<{ count: number }>>(
        `/api/v1/hr-notifications/unread-count`,
    );

export const markAllHRNotificationsAsUnread = () =>
    axios.patch<IApiResponse>(`/api/v1/hr-notifications/unread-all`);
