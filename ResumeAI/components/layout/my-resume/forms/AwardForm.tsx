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
import { AwardValidationSchema } from "@/lib/validations/resume"; // Tạo schema tương tự
import { addAwardToResume } from "@/lib/actions/resume.actions";
import { z } from "zod";

const awardFieldNames = ["name", "organization", "date"] as const;
type AwardFieldName = typeof awardFieldNames[number];

const fields: {
    name: AwardFieldName;
    label: string;
    type: "text";
}[] = [
        { name: "name", label: "Award Name", type: "text" },
        { name: "organization", label: "Issued By", type: "text" },
        { name: "date", label: "Date", type: "text" },
    ];

const AwardForm = ({ params }: { params: { id: string } }) => {
    const { formData, handleInputChange } = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof AwardValidationSchema>>({
        resolver: zodResolver(AwardValidationSchema),
        mode: "onChange",
        defaultValues: {
            awards: formData?.awards?.length > 0 ? formData.awards : [{
                name: "",
                organization: "",
                date: "",
            }],
        },
    });

    const { fields: formFields, append, remove } = useFieldArray({
        control: form.control,
        name: "awards",
    });

    const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newEntries = form.getValues("awards").slice();
        newEntries[index] = { ...newEntries[index], [name]: value };
        handleInputChange({ target: { name: "awards", value: newEntries } });
    };

    const AddNewAward = () => {
        const newEntry = { name: "", organization: "", date: "" };
        append(newEntry);
        const newEntries = [...form.getValues("awards"), newEntry];
        handleInputChange({ target: { name: "awards", value: newEntries } });
    };

    const RemoveAward = (index: number) => {
        remove(index);
        const newEntries = form.getValues("awards");
        handleInputChange({ target: { name: "awards", value: newEntries } });
    };

    const onSave = async (data: z.infer<typeof AwardValidationSchema>) => {
        setIsLoading(true);
        const result = await addAwardToResume(params.id, data.awards);
        if (result.success) {
            toast({ title: "Information saved.", description: "Awards updated successfully.", className: "bg-white" });
            handleInputChange({ target: { name: "awards", value: data.awards } });
        } else {
            toast({ title: "Uh Oh! Something went wrong.", description: result?.error, variant: "destructive", className: "bg-white" });
        }
        setIsLoading(false);
    };

    return (
        <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Awards</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add your awards</p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSave)} className="mt-5">
                    {formFields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                            {fields.map((config) => (
                                <FormField
                                    key={config.name}
                                    control={form.control}
                                    name={`awards.${index}.${config.name}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-md">{config.label}:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type={config.type}
                                                    {...field}
                                                    value={field.value as string}
                                                    className={`no-focus ${form.formState.errors.awards?.[index]?.[config.name] ? "error" : ""}`}
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
                            <Button variant="outline" onClick={AddNewAward} className="text-primary" type="button">
                                <Plus className="size-4 mr-2" /> Add More
                            </Button>
                            <Button variant="outline" onClick={() => RemoveAward(formFields.length - 1)} className="text-primary" type="button">
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

export default AwardForm;
