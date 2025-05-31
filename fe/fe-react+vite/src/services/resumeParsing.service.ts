import axios from '@/config/axios-customize';
import { ParsedResume } from '@/contexts/ResumeContext';

export const callUploadAndParseCVs = (files: File[]): Promise<ParsedResume[]> => {
    const form = new FormData();
    files.forEach(f => form.append('cvs', f));

    return axios
        .post<ParsedResume[]>('/api/v1/parsing-resumes/upload-and-parse', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(res => res.data);
};
