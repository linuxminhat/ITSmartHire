import { useFormContext } from "@/lib/context/FormProvider";
import { themeColors } from "@/lib/utils";
import React from "react";

const CertificatePreview = () => {
    const { formData } = useFormContext();

    if (!formData?.certificates || formData.certificates.length === 0) return null;

    return (
        <div className="my-6">
            <h2
                className="text-center font-bold text-sm mb-2"
                style={{
                    color: formData?.themeColor || themeColors[0],
                }}
            >
                Certificates
            </h2>
            <hr
                style={{
                    borderColor: formData?.themeColor || themeColors[0],
                }}
            />

            {formData.certificates.map((cert: any, index: number) => (
                <div key={index} className="my-3">
                    <h2
                        className="text-sm font-bold"
                        style={{
                            color: formData?.themeColor || themeColors[0],
                        }}
                    >
                        {cert.name}
                    </h2>
                    <div className="text-xs flex flex-wrap gap-2">
                        {cert.organization && <span>{cert.organization}</span>}
                        {cert.date && <span>| {cert.date}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CertificatePreview;
