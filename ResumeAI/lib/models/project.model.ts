import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String },
    time: { type: String },
    role: { type: String },
    description: { type: String },
    technologies: [{ type: String }],
    result: { type: String },
});

const Project =
    mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
