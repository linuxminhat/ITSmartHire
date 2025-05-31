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
                    <th className="p-2">Name</th>
                    <th className="p-2">University</th>
                    <th className="p-2">GitHub</th>
                    <th className="p-2">Skills</th>
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
                        <td className="p-2">{p.skills.join(', ')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PreviewTable;
