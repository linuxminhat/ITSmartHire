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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useFormContext } from "@/lib/context/FormProvider";
import { Plus, Minus, Loader2, Brain } from "lucide-react";
import React, { useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectValidationSchema } from "@/lib/validations/resume"; // Tạo schema tương tự
import { addProjectToResume } from "@/lib/actions/resume.actions";
import { generateProjectDescription } from "@/lib/actions/gemini.actions";
import { z } from "zod";

const projectFieldNames = [
    "name", "link", "time", "role", "technologies", "result", "description"
] as const;

type ProjectFieldName = typeof projectFieldNames[number];

const fields: {
    name: ProjectFieldName;
    label: string;
    type: "text" | "textarea";
}[] = [
        { name: "name", label: "Project Name", type: "text" },
        { name: "link", label: "Project Link", type: "text" },
        { name: "time", label: "Time Period", type: "text" },
        { name: "role", label: "Role", type: "text" },
        { name: "technologies", label: "Technologies (comma separated)", type: "text" },
        { name: "result", label: "Result", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
    ];

const ProjectForm = ({ params }: { params: { id: string } }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const { formData, handleInputChange } = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiGeneratedList, setAiGeneratedList] = useState<any[]>([]);
    const [currentAiIndex, setCurrentAiIndex] = useState(0);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof ProjectValidationSchema>>({
        resolver: zodResolver(ProjectValidationSchema),
        mode: "onChange",
        defaultValues: {
            projects: formData?.projects?.length > 0 ? formData.projects : [{
                name: "",
                link: "",
                time: "",
                role: "",
                description: "",
                technologies: "",
                result: "",
            }],
        },
    });

    const { fields: formFields, append, remove } = useFieldArray({
        control: form.control,
        name: "projects",
    });

    const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        const newEntries = form.getValues("projects").slice();
        newEntries[index] = { ...newEntries[index], [name]: value };
        handleInputChange({ target: { name: "projects", value: newEntries } });
    };
    const AddNewProject = () => {
        append(newEntry);
        const newEntries = [...form.getValues("projects"), newEntry];
        handleInputChange({
            target: {
                name: "projects",
                value: newEntries,
            },
        });
    };


    const newEntry = {
        name: "",
        link: "",
        time: "",
        role: "",
        description: "",
        result: "",
        technologies: [],  // <-- luôn là array!
    };

    const RemoveProject = (index: number) => {
        remove(index);
        const newEntries = form.getValues("projects");
        if (currentAiIndex >= newEntries.length) setCurrentAiIndex(newEntries.length - 1 >= 0 ? newEntries.length - 1 : 0);
        handleInputChange({ target: { name: "projects", value: newEntries } });
    };

    // AI Generate Project Description
    const generateProjectDescriptionFromAI = async (index: number) => {
        const project = form.getValues("projects")[index];
        if (!project.name || !project.technologies) {
            toast({
                title: "Uh Oh! Something went wrong.",
                description: "Please enter project name and technologies for AI suggestion.",
                variant: "destructive",
                className: "bg-white border-2",
            });
            return;
        }
        setCurrentAiIndex(index);
        setIsAiLoading(true);

        const result = await generateProjectDescription(`${project.name} using ${project.technologies}`);
        setAiGeneratedList(result);
        setIsAiLoading(false);

        setTimeout(() => {
            listRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const onSave = async (data: z.infer<typeof ProjectValidationSchema>) => {
        setIsLoading(true);
        const result = await addProjectToResume(params.id, data.projects);
        if (result.success) {
            toast({ title: "Information saved.", description: "Projects updated successfully.", className: "bg-white" });
            handleInputChange({ target: { name: "projects", value: data.projects } });
        } else {
            toast({ title: "Uh Oh! Something went wrong.", description: result?.error, variant: "destructive", className: "bg-white" });
        }
        setIsLoading(false);
    };

    return (
        <div>
            <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
                <h2 className="text-lg font-semibold leading-none tracking-tight">Projects</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add your project details</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="mt-5">
                        {formFields.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                                {fields.map((config) => (
                                    <FormField
                                        key={config.name}
                                        control={form.control}
                                        name={`projects.${index}.${config.name}`}
                                        render={({ field }) => (
                                            <FormItem className={config.type === "textarea" ? "col-span-2" : ""}>
                                                <div className="flex justify-between items-end">
                                                    <FormLabel className="text-slate-700 font-semibold text-md">{config.label}:</FormLabel>
                                                    {config.name === "description" && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => generateProjectDescriptionFromAI(index)}
                                                            type="button"
                                                            size="sm"
                                                            className="border-primary text-primary flex gap-2"
                                                            disabled={isAiLoading}
                                                        >
                                                            {isAiLoading && currentAiIndex === index ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Brain className="h-4 w-4" />
                                                            )}{" "}
                                                            Generate from AI
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormControl>
                                                    {config.name === "technologies" ? (
                                                        <Input
                                                            type="text"
                                                            value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                                                            className={`no-focus ${form.formState.errors.projects?.[index]?.[config.name] ? "error" : ""}`}
                                                            onChange={(e) => {
                                                                const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                                                field.onChange(arr);
                                                                const newEntries = form.getValues("projects").slice();
                                                                newEntries[index] = { ...newEntries[index], technologies: arr };
                                                                handleInputChange({ target: { name: "projects", value: newEntries } });
                                                            }}
                                                        />
                                                    ) : config.type === "textarea" ? (
                                                        <Textarea
                                                            {...field}
                                                            value={field.value as string}
                                                            onChange={(e) => { field.onChange(e); handleChange(index, e); }}
                                                            className={`no-focus ${form.formState.errors.projects?.[index]?.[config.name] ? "error" : ""}`}
                                                            rows={6}
                                                        />
                                                    ) : (
                                                        <Input
                                                            type={config.type}
                                                            {...field}
                                                            value={field.value as string}
                                                            className={`no-focus ${form.formState.errors.projects?.[index]?.[config.name] ? "error" : ""}`}
                                                            onChange={(e) => { field.onChange(e); handleChange(index, e); }}
                                                        />
                                                    )}
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
                                <Button variant="outline" onClick={AddNewProject} className="text-primary" type="button">
                                    <Plus className="size-4 mr-2" /> Add More
                                </Button>
                                <Button variant="outline" onClick={() => RemoveProject(formFields.length - 1)} className="text-primary" type="button">
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
            {aiGeneratedList.length > 0 && (
                <div className="my-5" ref={listRef}>
                    <h2 className="font-bold text-lg">Suggestions</h2>
                    {aiGeneratedList.map((item: any, idx: number) => (
                        <div
                            key={idx}
                            onClick={() => {
                                form.setValue(`projects.${currentAiIndex}.description`, item?.description, { shouldValidate: true });
                                handleInputChange({ target: { name: "projects", value: form.getValues("projects") } });
                            }}
                            className={`p-5 shadow-lg my-4 rounded-lg border-t-2 ${isAiLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                            aria-disabled={isAiLoading}
                        >
                            <h2 className="font-semibold my-1 text-primary text-gray-800">
                                Level: {item?.activity_level}
                            </h2>
                            <p className="text-justify text-gray-600">{item?.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectForm;
