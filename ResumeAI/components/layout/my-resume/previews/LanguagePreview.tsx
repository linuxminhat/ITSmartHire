import { useFormContext } from "@/lib/context/FormProvider";
import { themeColors } from "@/lib/utils";
import React from "react";

const LanguagePreview = () => {
    const { formData } = useFormContext();

    if (!formData?.languages || formData.languages.length === 0) return null;

    return (
        <div className="my-6">
            <h2
                className="text-center font-bold text-sm mb-2"
                style={{
                    color: formData?.themeColor || themeColors[0],
                }}
            >
                Languages
            </h2>
            <hr
                style={{
                    borderColor: formData?.themeColor || themeColors[0],
                }}
            />

            <div className="grid grid-cols-2 gap-x-10 max-md:gap-x-4 gap-y-3 my-5">
                {formData.languages.map((lang: any, index: number) => (
                    <div key={index} className="flex flex-col">
                        <span className="text-xs font-medium">{lang.name}</span>
                        <span className="text-xs italic">{lang.proficiency}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LanguagePreview;
