"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useFormContext } from "@/lib/context/FormProvider";
import { Plus, Minus, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CertificateValidationSchema } from "@/lib/validations/resume"; // Tạo schema tương tự
import { addCertificateToResume } from "@/lib/actions/resume.actions";
import { z } from "zod";

const certificateFieldNames = ["name", "organization", "date"] as const;
type CertificateFieldName = typeof certificateFieldNames[number];

const fields: {
    name: CertificateFieldName;
    label: string;
    type: "text";
}[] = [
        { name: "name", label: "Certificate Name", type: "text" },
        { name: "organization", label: "Issued By", type: "text" },
        { name: "date", label: "Date", type: "text" },
    ];

const CertificateForm = ({ params }: { params: { id: string } }) => {
    const { formData, handleInputChange } = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof CertificateValidationSchema>>({
        resolver: zodResolver(CertificateValidationSchema),
        mode: "onChange",
        defaultValues: {
            certificates: formData?.certificates?.length > 0 ? formData.certificates : [{
                name: "",
                organization: "",
                date: "",
            }],
        },
    });

    const { fields: formFields, append, remove } = useFieldArray({
        control: form.control,
        name: "certificates",
    });

    const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newEntries = form.getValues("certificates").slice();
        newEntries[index] = { ...newEntries[index], [name]: value };
        handleInputChange({ target: { name: "certificates", value: newEntries } });
    };

    const AddNewCertificate = () => {
        const newEntry = { name: "", organization: "", date: "" };
        append(newEntry);
        const newEntries = [...form.getValues("certificates"), newEntry];
        handleInputChange({ target: { name: "certificates", value: newEntries } });
    };

    const RemoveCertificate = (index: number) => {
        remove(index);
        const newEntries = form.getValues("certificates");
        handleInputChange({ target: { name: "certificates", value: newEntries } });
    };

    const onSave = async (data: z.infer<typeof CertificateValidationSchema>) => {
        setIsLoading(true);
        const result = await addCertificateToResume(params.id, data.certificates);
        if (result.success) {
            toast({ title: "Information saved.", description: "Certificates updated successfully.", className: "bg-white" });
            handleInputChange({ target: { name: "certificates", value: data.certificates } });
        } else {
            toast({ title: "Uh Oh! Something went wrong.", description: result?.error, variant: "destructive", className: "bg-white" });
        }
        setIsLoading(false);
    };

    return (
        <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Certificates</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add your certificates</p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSave)} className="mt-5">
                    {formFields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                            {fields.map((config) => (
                                <FormField
                                    key={config.name}
                                    control={form.control}
                                    name={`certificates.${index}.${config.name}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-md">{config.label}:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type={config.type}
                                                    {...field}
                                                    value={field.value as string}
                                                    className={`no-focus ${form.formState.errors.certificates?.[index]?.[config.name] ? "error" : ""}`}
                                                    onChange={(e) => { field.onChange(e); handleChange(index, e); }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    ))}
                    <div className="mt-3 flex gap-2 justify-between">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={AddNewCertificate} className="text-primary" type="button">
                                <Plus className="size-4 mr-2" /> Add More
                            </Button>
                            <Button variant="outline" onClick={() => RemoveCertificate(formFields.length - 1)} className="text-primary" type="button">
                                <Minus className="size-4 mr-2" /> Remove
                            </Button>
                        </div>
                        <Button type="submit" disabled={isLoading || !form.formState.isValid} className="bg-primary-700 hover:bg-primary-800 text-white">
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> &nbsp; Saving
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default CertificateForm;
