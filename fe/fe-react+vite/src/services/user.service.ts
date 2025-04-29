import { IBackendRes, IGetAccount, IUser, IModelPaginate, IApiResponse, IEducation, IExperience, IUserProfileUpdatePayload, IAttachedCv, IAttachedCvPayload } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 *
Module User
 */

// Tham khảo user.tsx, payload có thể cần gender, role, age, company
export const callCreateUser = (data: Partial<IUser>) => {
    // Ví dụ: Gửi đi name, email, password, age, gender, address, role, company._id
    // Cần điều chỉnh payload dựa trên định nghĩa API của bạn
    return axios.post<IBackendRes<IUser>>('/api/v1/users', data);
}

// Tham khảo user.tsx, payload có thể cần các trường tương tự create
export const callUpdateUser = (id: string, data: Partial<IUser>) => {
    // Ví dụ: Gửi đi _id, name, age, gender, address, role, company._id
    // Lưu ý: API update thường không cho đổi email, password
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}`, data);
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

// Tham khảo buildQuery trong user.tsx, cần populate role
export const callFetchUser = (query: string) => {
    // Đảm bảo query bao gồm populate=role&fields=role._id, role.name nếu cần hiển thị tên Role
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

export const callFetchUserById = (id: string) => {
    // Có thể cần populate thêm nếu muốn xem chi tiết hơn
    return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}?populate=role,company&fields=company._id, company.name, role._id, role.name`);
}

// New function to fetch current user's profile
export const callGetUserProfile = () => {
    // Backend service now populates education
    return axios.get<IBackendRes<IUser>>('/api/v1/users/profile');
};

export const callUpdateUserProfile = (payload: IUserProfileUpdatePayload) => {
    // This function now correctly expects the imported IUserProfileUpdatePayload type
    return axios.patch<IBackendRes<IUser>>('/api/v1/users/profile', payload);
};

// --- Education Profile Section --- 

// Define payload type for adding/updating education
// Similar to IEducation but without _id for adding, and all optional for updating
export interface IEducationPayload {
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string | Date;
    endDate?: string | Date;
    description?: string;
}

// Add Education
export const callAddEducation = (payload: IEducationPayload) => {
    // Backend returns the full updated User object including the new education array
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/education', payload);
};

// Update Education
export const callUpdateEducation = (eduId: string, payload: Partial<IEducationPayload>) => {
    // Backend returns the full updated User object
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/education/${eduId}`, payload);
};

// Delete Education
export const callDeleteEducation = (eduId: string) => {
    // Backend returns the full updated User object after deletion
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/education/${eduId}`);
};
// -------------------------------- 

// --- Experience Profile Section --- 

// Define payload type for adding/updating experience
export interface IExperiencePayload {
    companyName: string;
    jobTitle: string;
    location?: string;
    startDate: string | Date;
    endDate?: string | Date;
    description?: string;
}

// Add Experience
export const callAddExperience = (payload: IExperiencePayload) => {
    // Correct path relative to baseURL (assuming baseURL includes /api/v1)
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/experience', payload);
};

// Update Experience
export const callUpdateExperience = (expId: string, payload: Partial<IExperiencePayload>) => {
    // Correct path relative to baseURL
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/experience/${expId}`, payload);
};

// Delete Experience
export const callDeleteExperience = (expId: string) => {
    // Correct path relative to baseURL
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/experience/${expId}`);
};
// ---------------------------------- 

// --- Skills Profile Section --- 

// Payload for updating skills
export interface IUserSkillsUpdatePayload {
    skills: string[]; // Required array of strings
}

// Update User Skills
export const callUpdateUserSkills = (payload: IUserSkillsUpdatePayload) => {
    // Backend returns the full updated User object
    return axios.patch<IBackendRes<IUser>>('/api/v1/users/profile/skills', payload);
};
// ----------------------------

// --- Project Profile Section --- 

// Define payload type for adding/updating project
export interface IProjectPayload {
    name: string;
    url?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    description?: string;
    technologiesUsed?: string[];
}

// Add Project
export const callAddProject = (payload: IProjectPayload) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/project', payload);
};

// Update Project
export const callUpdateProject = (projectId: string, payload: Partial<IProjectPayload>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/project/${projectId}`, payload);
};

// Delete Project
export const callDeleteProject = (projectId: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/project/${projectId}`);
};
// -----------------------------

// --- Certificate Profile Section --- 

// Define payload type for adding/updating certificate
export interface ICertificatePayload {
    name: string;
    issuingOrganization: string;
    issueDate?: string | Date;
    expirationDate?: string | Date;
    credentialId?: string;
    credentialUrl?: string;
}

// Add Certificate
export const callAddCertificate = (payload: ICertificatePayload) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/certificate', payload);
};

// Update Certificate
export const callUpdateCertificate = (certId: string, payload: Partial<ICertificatePayload>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/certificate/${certId}`, payload);
};

// Delete Certificate
export const callDeleteCertificate = (certId: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/certificate/${certId}`);
};
// ---------------------------------

// --- Award Profile Section --- 

// Define payload type for adding/updating award
export interface IAwardPayload {
    title: string;
    issuer?: string;
    issueDate?: string | Date;
    description?: string;
}

// Add Award
export const callAddAward = (payload: IAwardPayload) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/award', payload);
};

// Update Award
export const callUpdateAward = (awardId: string, payload: Partial<IAwardPayload>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/award/${awardId}`, payload);
};

// Delete Award
export const callDeleteAward = (awardId: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/award/${awardId}`);
};
// ---------------------------

// --- Attached CV Service Functions --- 

export const callGetAttachedCvs = () => {
    return axios.get<IBackendRes<IAttachedCv[]>>('/api/v1/users/me/attached-cvs');
};

export const callAddAttachedCv = (payload: IAttachedCvPayload) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users/me/attached-cvs', payload);
};

export const callDeleteAttachedCv = (cvId: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/me/attached-cvs/${cvId}`);
};

// --- End Attached CV Service Functions --- 