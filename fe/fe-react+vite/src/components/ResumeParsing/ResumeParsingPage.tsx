// src/components/ResumeParsing/ResumeParsingPage.tsx
import React, { useState, useContext } from 'react'
import { ResumeProvider, ResumeContext } from '../../contexts/ResumeContext'
import Toolbar from './Toolbar'
import UploadSection from './UploadSection'
import DataTable from './DataTable'
import FileListModal from './FileListModal'
import { callUploadAndParseCVs } from '@/services/resumeParsing.service'

const Inner: React.FC = () => {
    const { files, setFiles, setParsed } = useContext(ResumeContext)
    const [showFileList, setShowFileList] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleParseAll = async () => {
        if (!files.length) return
        setIsLoading(true)
        setError(null)
        
        try {
            setFiles(fs => fs.map(f => ({ ...f, status: 'parsing', progress: 0 })))
            
            console.log('Sending files:', files.map(f => f.file.name));
            
            const response = await callUploadAndParseCVs(files.map(f => f.file))
            
            console.log('Response from service:', response);
            
            if (!response.success || !response.data) {
                throw new Error('Invalid response from server');
            }

            // Đảm bảo data là mảng
            const parsedData = Array.isArray(response.data) ? response.data : [response.data];
            
            // Set parsed data
            setParsed(parsedData);
            
            // Update file status
            setFiles(fs => fs.map(f => ({ ...f, status: 'done', progress: 100 })))
            
            console.log('Successfully parsed CVs:', parsedData);
            
        } catch (err) {
            console.error('Parse error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý CV';
            setError(errorMessage);
            setFiles(fs => fs.map(f => ({ ...f, status: 'error' })));
        } finally {
            setIsLoading(false)
        }
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="text-red-600 font-medium">Lỗi xử lý CV:</h3>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center space-x-2">
                <Toolbar
                    onShowFileList={() => setShowFileList(true)}
                    onParseAll={handleParseAll}
                />
            </div>

            <UploadSection />

            <div className="flex-1 overflow-hidden">
                <DataTable />
            </div>

            {showFileList && <FileListModal onClose={() => setShowFileList(false)} />}
        </>
    )
}

const ResumeParsingPage: React.FC = () => (
    <ResumeProvider>
        <div className="flex flex-col h-full p-6 space-y-4">
            <Inner />
        </div>
    </ResumeProvider>
)


export default ResumeParsingPage
