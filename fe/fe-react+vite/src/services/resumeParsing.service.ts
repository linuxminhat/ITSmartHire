import axios from '@/config/axios-customize';
import { ParsedResume } from '@/contexts/ResumeContext';

interface ApiResponse {
    success: boolean;
    data: ParsedResume[];
    message?: string;
}

// Backend response wrapper
interface BackendResponse {
    statusCode: number;
    message: string;
    data: ApiResponse;
}

export const callUploadAndParseCVs = async (files: File[]): Promise<ApiResponse> => {
    try {
        const form = new FormData();
        
        // Debug: Log files before adding to FormData
        console.log('Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
        
        files.forEach((file, index) => {
            console.log(`Adding file ${index}:`, file.name);
            form.append('cvs', file);
        });

        // Debug: Log FormData contents
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
                timeout: 120000, // 2 minutes timeout
            }
        );

        console.log('Full backend response:', response);
        console.log('Response data:', response.data);

        // Direct access to response.data (not nested)
        const responseData = response.data;
        
        if (responseData && responseData.success && responseData.data) {
            // Đảm bảo data luôn là mảng
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

        // If responseData.success is false, throw with the backend message
        throw new Error(responseData?.message || 'Invalid response format from server');
        
    } catch (error: any) {
        console.error('Full error object:', error);
        
        if (error.response) {
            // Server responded with error status
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
            // Request was made but no response received
            console.error('Network error - no response:', error.request);
            throw new Error('Network error: Could not connect to server');
        } else {
            // Something else happened
            console.error('Other error:', error.message);
            throw new Error(error.message || 'Unknown error occurred');
        }
    }
};