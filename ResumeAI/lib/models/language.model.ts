import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    proficiency: { type: String },
});

const Language =
    mongoose.models.Language || mongoose.model("Language", languageSchema);

export default Language;
