import React, { createContext, useState, ReactNode, useEffect } from 'react';

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
}

// 3. Interface cho giá trị context
interface ResumeContextValue {
    files: FileItem[];
    setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    parsed: ParsedResume[];
    setParsed: React.Dispatch<React.SetStateAction<ParsedResume[]>>;
}

// 4. Tạo context với giá trị mặc định
export const ResumeContext = createContext<ResumeContextValue>({
    files: [],
    setFiles: () => { },
    parsed: [],
    setParsed: () => { },
});

// 5. Provider component
export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [parsed, setParsed] = useState<ParsedResume[]>([]);

    // Thêm log để kiểm tra khi state thay đổi
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
