import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "New Chat"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pdf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pdf",
        default: null
    }
}, { timestamps: true });

const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;