import { useFormContext } from "@/lib/context/FormProvider";
import { themeColors } from "@/lib/utils";
import React from "react";

const AwardPreview = () => {
    const { formData } = useFormContext();

    if (!formData?.awards || formData.awards.length === 0) return null;

    return (
        <div className="my-6">
            <h2
                className="text-center font-bold text-sm mb-2"
                style={{
                    color: formData?.themeColor || themeColors[0],
                }}
            >
                Awards
            </h2>
            <hr
                style={{
                    borderColor: formData?.themeColor || themeColors[0],
                }}
            />

            {formData.awards.map((award: any, index: number) => (
                <div key={index} className="my-3">
                    <h2
                        className="text-sm font-bold"
                        style={{
                            color: formData?.themeColor || themeColors[0],
                        }}
                    >
                        {award.name}
                    </h2>
                    <div className="text-xs flex flex-wrap gap-2">
                        {award.organization && <span>{award.organization}</span>}
                        {award.date && <span>| {award.date}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AwardPreview;
