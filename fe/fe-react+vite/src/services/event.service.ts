import { IBackendRes } from "@/types/backend";
import axios from "@/config/axios-customize";

import { IEvent } from "@/types/interview-event";
export const getEvents = (start: Date, end: Date) =>
    axios.get<IEvent[]>(`/api/v1/events`, {
        params: { range: `${start.toISOString()}..${end.toISOString()}` },
    });

export const createEvent = (data: Partial<IEvent>) =>
    axios.post<IBackendRes<IEvent>>('/api/v1/events', data);

export const updateEvent = (id: string, data: Partial<IEvent>) =>
    axios.patch<IBackendRes<IEvent>>(`/api/v1/events/${id}`, data);

export const deleteEvent = (id: string) =>
    axios.delete<IBackendRes<IEvent>>(`/api/v1/events/${id}`);