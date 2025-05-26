import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String },
    organization: { type: String },
});

const Certificate =
    mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

export default Certificate;
