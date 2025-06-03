import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';

// 1. Định nghĩa kiểu dữ liệu cho từng file upload
export interface FileItem {
    id: string;
    file: File;
    status: 'pending' | 'parsing' | 'done' | 'error';
    progress: number;
}

// 2. Định nghĩa tất cả các trường sẽ hiển thị trong bảng
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

// 3. Interface cho giá trị context
interface ResumeContextValue {
    files: FileItem[];
    setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    parsed: ParsedResume[];
    setParsed: React.Dispatch<React.SetStateAction<ParsedResume[]>>;
}

const STORAGE_KEY = 'resume_parsing_state';

// 4. Tạo context với giá trị mặc định
export const ResumeContext = createContext<ResumeContextValue>({
    files: [],
    setFiles: () => { },
    parsed: [],
    setParsed: () => { },
});

// 5. Provider component
export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Khôi phục state từ localStorage khi component mount
    const [files, setFiles] = useState<FileItem[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Khôi phục File objects từ stored data
            return parsed.files.map((f: any) => ({
                ...f,
                file: new File([], f.file.name, {
                    type: f.file.type,
                })
            }));
        }
        return [];
    });

    const [parsed, setParsed] = useState<ParsedResume[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.parsed || [];
        }
        return [];
    });

    // Lưu state vào localStorage khi có thay đổi
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

    // Thêm event listener để cảnh báo khi rời trang
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

    // Thêm effect để cảnh báo khi chuyển route trong ứng dụng
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

    // Thêm effect để kiểm tra khi state thay đổi
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
