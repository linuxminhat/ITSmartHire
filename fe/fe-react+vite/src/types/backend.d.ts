//Backend Response
export interface IBackendRes<T> {
    status: boolean;
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        _id: string;
        email: string;
        name: string;
        role: {
            _id: string;
            name: string;
        }
        permissions: {
            _id: string;
            name: string;
            apiPath: string;
            method: string;
            module: string;
        }[]
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    longitude?: number;
    latitude?: number;
    _id: string;
    name?: string;
    address?: string;
    logo?: string;
    description?: string;
    skills?: ISkill[] | string[];
    specializationDescription?: string;
    companyModel?: string;
    industry?: string;
    companySize?: string;
    country?: string;
    workingTime?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IEducation {
    _id?: string;
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string | Date;
    endDate?: string | Date;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IExperience {
    _id?: string;
    companyName: string;
    jobTitle: string;
    location?: string;
    startDate: string | Date;
    endDate?: string | Date;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

// --- New Project Type ---
export interface IProject {
    _id?: string;
    name: string;
    url?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    description?: string;
    technologiesUsed?: string[];
    createdAt?: string;
    updatedAt?: string;
}

// --- New Certificate Type ---
export interface ICertificate {
    _id?: string;
    name: string;
    issuingOrganization: string;
    issueDate?: string | Date;
    expirationDate?: string | Date;
    credentialId?: string;
    credentialUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

// --- New Award Type ---
export interface IAward {
    _id?: string;
    name: string;
    issuingOrganization?: string;
    issueDate?: string | Date;
    description?: string;
}

export interface IAttachedCv {
    _id: string;
    name: string;
    url: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    age?: number;
    gender?: string;
    address?: string;
    phone?: string;
    jobTitle?: string;
    designation?: string;
    linkedIn?: string;
    portfolio?: string;
    aboutMe?: string;
    role?: { _id: string; name: string; }
    company?: { _id: string; name: string; }
    education?: IEducation[];
    experience?: IExperience[];
    skills?: string[];
    projects?: IProject[];
    certificates?: ICertificate[];
    awards?: IAward[];
    attachedCvs?: IAttachedCv[]; // Use the array field
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    _id?: string;
    name: string;
    skills: ISkill[] | string[];
    category?: ICategory | string;
    company?: {
        _id: string;
        name: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    experience: string;
    jobType: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isHot?: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    _id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    companyId: string | {
        _id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        _id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { _id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPermission {
    _id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    _id?: string;
    name: string;
    description: string;
    isActive: boolean;
    permissions: IPermission[] | string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    userCount?: number;
}

export interface ISkill {
    _id?: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    recruitCount?: number;  // server trả về

}

export interface ICategory {
    skills: never[];
    recruitCount: number;
    description: string;
    isActive: boolean;
    _id?: string;
    name: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    _id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IApiResponse {
    statusCode: number | string;
    message: string;
}
export interface IBackendResWithResultArray<T> {
    statusCode: number | string;
    message: string;
    result: T[];
}

export interface IUserProfileUpdatePayload {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    phone?: string;
    aboutMe?: string;
    jobTitle?: string;
    designation?: string;
    linkedIn?: string;
    portfolio?: string;
}

export interface IEducationPayload extends Omit<IEducation, '_id'> { }

export interface IExperiencePayload extends Omit<IExperience, '_id'> { }

export interface IUserSkillsUpdatePayload {
    skills: string[];
}

export interface IProjectPayload extends Omit<IProject, '_id'> { }

export interface ICertificatePayload extends Omit<ICertificate, '_id'> { }

export interface IAwardPayload extends Omit<IAward, '_id'> { }

// Payload for adding a new attached CV
export interface IAttachedCvPayload extends Omit<IAttachedCv, '_id' | 'createdAt' | 'updatedAt'> { } // Payload for name & url

// Company Comments Interface
export interface ICompanyComment {
    _id?: string;
    companyId: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    } | string;
    rating: number; // 1-5 stars
    comment: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICompanyCommentPayload {
    companyId: string;
    rating: number;
    comment: string;
}
