import React, { useContext } from 'react';
import { ResumeContext } from '../../contexts/ResumeContext';

const PreviewTable: React.FC = () => {
    const { parsed } = useContext(ResumeContext);

    if (!parsed.length) return null;

    return (
        <table className="w-full mt-4 table-auto">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Họ và tên</th>
                    <th className="p-2">Trường</th>
                    <th className="p-2">GitHub</th>
                    <th className="p-2">Kỹ năng</th>
                    <th className="p-2">Kinh nghiệm</th>
                </tr>
            </thead>
            <tbody>
                {parsed.map((p, i) => (
                    <tr key={i} className="border-b">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{p.name || '-'}</td>
                        <td className="p-2">{p.university || '-'}</td>
                        <td className="p-2">
                            {p.github ? (
                                <a href={p.github} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                    {p.github}
                                </a>
                            ) : '-'}
                        </td>
                        <td className="p-2">{p.skills?.join(', ') || '-'}</td>
                        <td className="p-2">
                            {p.workExperiences?.map(exp => 
                                `${exp.company} (${exp.position})`
                            ).join(', ') || '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PreviewTable;
