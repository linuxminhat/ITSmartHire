import mongoose from "mongoose";

const awardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organization: { type: String },
    date: { type: String },
});

const Award =
    mongoose.models.Award || mongoose.model("Award", awardSchema);

export default Award;
