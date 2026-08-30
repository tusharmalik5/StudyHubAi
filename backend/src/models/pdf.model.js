import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["processing", "ready", "failed"],
        default: "processing"
    },
    totalChunks: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const pdfModel = mongoose.model("Pdf", pdfSchema);
export default pdfModel;