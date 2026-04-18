import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["user", "assistant"] },
    message: { type: String },
    mode: { type: String, default: "friendly" }, // 👈 personality mode
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", chatSchema);
export default ChatModel;