import axios from '@/config/axios-customize';
import { IBackendRes, ICompanyComment, ICompanyCommentPayload, IBackendResWithResultArray } from "@/types/backend";

export const callCreateComment = (commentData: ICompanyCommentPayload): Promise<IBackendRes<ICompanyComment>> => {
    return axios.post('/api/v1/comments', commentData);
}

export const callFetchCommentByCompany = (companyId: string): Promise<IBackendResWithResultArray<ICompanyComment>> => {
    return axios.get(`/api/v1/comments/company/${companyId}`);
}

export const callUpdateComment = (id: string, commentData: Partial<ICompanyCommentPayload>): Promise<IBackendRes<ICompanyComment>> => {
    return axios.patch(`/api/v1/comments/${id}`, commentData);
}

export const callDeleteComment = (id: string): Promise<IBackendRes<any>> => {
    return axios.delete(`/api/v1/comments/${id}`);
}