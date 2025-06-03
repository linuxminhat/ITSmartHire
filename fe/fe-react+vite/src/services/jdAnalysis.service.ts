import axios from '@/config/axios-customize';
import { ParsedResume } from '@/contexts/ResumeContext';

interface ScoreResult {
    resumeId: string;
    totalScore: number;
    scores: {
        experienceScore: number;
        skillsScore: number;
        educationScore: number;
        certificatesScore: number;
    };
    matchingKeywords: string[];
}

export const analyzeWithJD = async (
    jd: string, 
    resumes: ParsedResume[]
): Promise<ScoreResult[]> => {
    try {
        const response = await axios.post('/api/v1/resume-analysis/analyze-jd', {
            jd,
            resumes
        });
        return response.data;
    } catch (error) {
        console.error('JD Analysis error:', error);
        throw error;
    }
};
