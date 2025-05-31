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

    const handleParseAll = async () => {
        if (!files.length) return
        setFiles(fs => fs.map(f => ({ ...f, status: 'parsing', progress: 0 })))
        try {
            const result = await callUploadAndParseCVs(files.map(f => f.file))
            setParsed(result)
            setFiles(fs => fs.map(f => ({ ...f, status: 'done', progress: 100 })))
        } catch {
            setFiles(fs => fs.map(f => ({ ...f, status: 'error' })))
        }
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
