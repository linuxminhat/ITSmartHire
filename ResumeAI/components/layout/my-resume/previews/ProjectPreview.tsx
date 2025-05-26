import { useFormContext } from "@/lib/context/FormProvider";
import { themeColors } from "@/lib/utils";
import React from "react";

const ProjectPreview = () => {
    const { formData } = useFormContext();

    if (!formData?.projects || formData.projects.length === 0) return null;

    return (
        <div className="my-6">
            <h2
                className="text-center font-bold text-sm mb-2"
                style={{
                    color: formData?.themeColor || themeColors[0],
                }}
            >
                Projects
            </h2>
            <hr
                style={{
                    borderColor: formData?.themeColor || themeColors[0],
                }}
            />

            {formData?.projects.map((project: any, index: number) => (
                <div key={index} className="my-5">
                    <h2
                        className="text-sm font-bold"
                        style={{
                            color: formData?.themeColor || themeColors[0],
                        }}
                    >
                        {project.name}
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-xs text-blue-600 underline"
                            >
                                [Link]
                            </a>
                        )}
                    </h2>
                    <div className="text-xs flex flex-wrap gap-2">
                        <span>{project.role}</span>
                        {project.time && <span>| {project.time}</span>}
                    </div>
                    <div className="text-xs flex flex-wrap gap-2">
                        {project.technologies && project.technologies.length > 0 && (
                            <span>
                                <b>Tech:</b> {project.technologies.join(", ")}
                            </span>
                        )}
                        {project.result && (
                            <span>
                                <b>Result:</b> {project.result}
                            </span>
                        )}
                    </div>
                    {project.description && (
                        <div
                            className="text-xs my-2 text-justify form-preview"
                            dangerouslySetInnerHTML={{
                                __html: project.description,
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProjectPreview;
