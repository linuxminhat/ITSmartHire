
import React, { createContext, useState, ReactNode } from 'react';

// 1. Định nghĩa kiểu dữ liệu cho từng file upload
export interface FileItem {
    id: string;
    file: File;
    status: 'pending' | 'parsing' | 'done' | 'error';
    progress: number;
}

// 2. Định nghĩa tất cả các trường sẽ hiển thị trong bảng
export interface ParsedResume {
    name?: string;                             // NAME
    email?: string;                            // EMAIL
    github?: string;                           // GITHUB
    loc?: string;                              // LOC
    phone?: string;                            // PHONE
    university?: string;                       // UNI
    deg?: string;                              // DEG
    gpa?: string;                              // GPA
    graduation_year?: string;                  // GRADUATION_YEAR
    working_company_experiences?: string[];    // WORKING_COMPANY_EXPERIENCES
    working_time_experiences?: string;         // WORKING_TIME_EXPERIENCES
    desig?: string;                            // DESIG
    techstack_skills?: string[];               // TECHSTACK_SKILLS
    project?: string;                          // PROJECT
    project_description?: string;              // PROJECT_DESCRIPTION
    certifications?: string[];                 // CERTIFICATION
    skills: string[];                          // SKILLS (nếu còn cần)
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
export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [parsed, setParsed] = useState<ParsedResume[]>([]);

    return (
        <ResumeContext.Provider value={{ files, setFiles, parsed, setParsed }}>
            {children}
        </ResumeContext.Provider>
    );
};
