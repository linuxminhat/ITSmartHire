import axios from '@/config/axios-customize';
import { ParsedResume } from '@/contexts/ResumeContext';

interface ApiResponse {
    success: boolean;
    data: ParsedResume[];
    message?: string;
}
interface BackendResponse {
    statusCode: number;
    message: string;
    data: ApiResponse;
}

export const callUploadAndParseCVs = async (files: File[]): Promise<ApiResponse> => {
    try {
        const form = new FormData();
        console.log('Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

        files.forEach((file, index) => {
            console.log(`Adding file ${index}:`, file.name);
            form.append('cvs', file);
        });

        console.log('FormData entries:');
        for (let [key, value] of form.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await axios.post<ApiResponse>(
            '/api/v1/parsing-resumes/upload-and-parse',
            form,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000,
            }
        );

        console.log('Full backend response:', response);
        console.log('Response data:', response.data);


        const responseData = response.data;

        if (responseData && responseData.success && responseData.data) {

            const parsedData = Array.isArray(responseData.data)
                ? responseData.data
                : [responseData.data];

            console.log('Successfully parsed CVs:', parsedData.length);

            return {
                success: true,
                data: parsedData,
                message: responseData.message
            };
        }


        throw new Error(responseData?.message || 'Invalid response format from server');

    } catch (error: any) {
        console.error('Full error object:', error);

        if (error.response) {

            console.error('Server error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            });

            const errorMessage = error.response.data?.message
                || error.message
                || 'Server error occurred';

            throw new Error(`Server error: ${errorMessage}`);
        } else if (error.request) {

            console.error('Network error - no response:', error.request);
            throw new Error('Network error: Could not connect to server');
        } else {

            console.error('Other error:', error.message);
            throw new Error(error.message || 'Unknown error occurred');
        }
    }
};

export const saveParseList = async (name: string, format: 'excel' | 'csv', cvs: any[]) => {
    try {
        console.log('Sending save request:', {
            url: '/api/v1/parsing-resumes/save-list',
            data: { name, format, cvCount: cvs.length }
        });

        const response = await axios.post('/api/v1/parsing-resumes/save-list', {
            name,
            format,
            cvs
        });

        console.log('Save response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Save error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export const getSavedLists = async () => {
    return axios.get('/api/v1/parsing-resumes/saved-lists');
};

export const deleteSavedList = async (id: string) => {
    return axios.delete(`/api/v1/parsing-resumes/saved-lists/${id}`);
};