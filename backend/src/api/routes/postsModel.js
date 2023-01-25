import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postsSchema = new Schema(
    {
        text: { type: String, required: true },
        username: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        image: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export default model("posts", postsSchema);
