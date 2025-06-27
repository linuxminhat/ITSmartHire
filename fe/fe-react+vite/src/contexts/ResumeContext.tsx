//context for uploading and parsing
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
//describe file upload data
export interface FileItem {
    id: string;
    file: File;
    status: 'pending' | 'parsing' | 'done' | 'error';
    progress: number;
}
//describe parsing result
export interface WorkExperience {
    company: string;
    position: string;
    designation: string;
    duration: string;
    description: string[];
}

export interface Project {
    name: string;
    description: string[];
}

export interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    github: string;
    location: string;
    university: string;
    degree: string;
    gpa: string;
    workExperiences: WorkExperience[];
    projects: Project[];
    skills: string[];
    certifications: string[];
    totalExperienceYears: number;
    languages: string[];
    awards: string[];
    designations: string[];
}

interface ResumeContextValue {
    files: FileItem[];
    setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    parsed: ParsedResume[];
    setParsed: React.Dispatch<React.SetStateAction<ParsedResume[]>>;
}

const STORAGE_KEY = 'resume_parsing_state';
export const ResumeContext = createContext<ResumeContextValue>({
    files: [],
    setFiles: () => { },
    parsed: [],
    setParsed: () => { },
});

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    //restore data
    const [files, setFiles] = useState<FileItem[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Khôi phục File objects từ stored data
            return parsed.files.map((f: any) => ({
                ...f,
                //Note: because the browser does not allow saving file content to localStorage, we only restore metadata (name, type), not content.
                file: new File([], f.file.name, {
                    type: f.file.type,
                })
            }));
        }
        return [];
    });

    //used to restored
    const [parsed, setParsed] = useState<ParsedResume[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.parsed || [];
        }
        return [];
    });

    //persist state into LocalStorage
    useEffect(() => {
        const state = {
            files: files.map(f => ({
                ...f,
                file: {
                    name: f.file.name,
                    type: f.file.type,
                }
            })),
            parsed
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [files, parsed]);

    //alert before leave page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (files.length > 0 || parsed.length > 0) {
                const message = 'Bạn có dữ liệu chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?';
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [files, parsed]);
    useEffect(() => {
        const handleRouteChange = () => {
            if (files.length > 0 || parsed.length > 0) {
                const shouldLeave = window.confirm(
                    'Bạn có dữ liệu chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?'
                );
                if (!shouldLeave) {
                    // Prevent navigation
                    window.history.pushState(null, '', window.location.pathname);
                    return false;
                }
            }
        };

        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, [files, parsed]);

    useEffect(() => {
        console.log('Files state changed:', files);
    }, [files]);

    useEffect(() => {
        console.log('Parsed state changed:', parsed);
    }, [parsed]);

    return (
        <ResumeContext.Provider value={{ files, setFiles, parsed, setParsed }}>
            {children}
        </ResumeContext.Provider>
    );
};
