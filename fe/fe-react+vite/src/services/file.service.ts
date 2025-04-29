import { IBackendRes } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('fileUpload', file);
    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files/upload',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "folder_type": folderType
        },
    });
} 