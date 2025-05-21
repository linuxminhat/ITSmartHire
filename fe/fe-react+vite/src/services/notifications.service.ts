import { IApiResponse, IBackendRes, IModelPaginate } from '@/types/backend';
import axios from '@/config/axios-customize';
//Cấu trúc Notification
export interface INotification {
    _id: string;
    userId: string;
    applicationId: string;
    jobId: string;
    companyName: string;
    status: string;
    isRead: boolean;
    message: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export const fetchUserNotifications = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<INotification>>>(`/api/v1/notifications?${query}`);
};

export const markNotificationAsRead = (id: string) => {
    return axios.patch<IApiResponse>(`/api/v1/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
    return axios.patch<IApiResponse>(`/api/v1/notifications/read-all`);
};

export const getUnreadNotificationCount = () => {
    return axios.get<IBackendRes<{ count: number }>>(`/api/v1/notifications/unread-count`);
};
export const markAllNotificationsAsUnread = () =>
    axios.patch<IApiResponse>('/api/v1/notifications/unread-all');