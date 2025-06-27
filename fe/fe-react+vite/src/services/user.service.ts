import { IBackendRes, IGetAccount, IUser, IModelPaginate, IApiResponse, IEducation, IExperience, IUserProfileUpdatePayload, IAttachedCv, IAttachedCvPayload } from '@/types/backend';
import axios from '@/config/axios-customize';

export const callCreateUser = (data: Partial<IUser>) => {

    return axios.post<IBackendRes<IUser>>('/api/v1/users', data);
}

export const callUpdateUser = (id: string, data: Partial<IUser>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}`, data);
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

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
    return axios.get<IBackendRes<IUser>>('/api/v1/users/profile');
};

export const callUpdateUserProfile = (payload: IUserProfileUpdatePayload) => {
    return axios.patch<IBackendRes<IUser>>('/api/v1/users/profile', payload);
};

// --- Education Profile Section --- 
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
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/education', payload);
};

// Update Education
export const callUpdateEducation = (eduId: string, payload: Partial<IEducationPayload>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/education/${eduId}`, payload);
};

// Delete Education
export const callDeleteEducation = (eduId: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/education/${eduId}`);
};
// -------------------------------- 

// --- Experience Profile Section --- 
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
    return axios.post<IBackendRes<IUser>>('/api/v1/users/profile/experience', payload);
};

// Update Experience
export const callUpdateExperience = (expId: string, payload: Partial<IExperiencePayload>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/profile/experience/${expId}`, payload);
};

// Delete Experience
export const callDeleteExperience = (expId: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/profile/experience/${expId}`);
};
// ---------------------------------- 

// --- Skills Profile Section --- 

// Payload for updating skills
export interface IUserSkillsUpdatePayload {
    skills: string[];
}

// Update User Skills
export const callUpdateUserSkills = (payload: IUserSkillsUpdatePayload) => {
    return axios.patch<IBackendRes<IUser>>('/api/v1/users/profile/skills', payload);
};
// ----------------------------

// --- Project Profile Section --- 
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

// Thêm interface riêng cho việc cập nhật designation
export interface IDesignationUpdatePayload {
    designation: string;
}

// Thêm function cập nhật designation
export const callUpdateDesignation = (payload: IDesignationUpdatePayload) => {
    return axios.patch<IBackendRes<IUser>>('/api/v1/users/profile', payload);
};


