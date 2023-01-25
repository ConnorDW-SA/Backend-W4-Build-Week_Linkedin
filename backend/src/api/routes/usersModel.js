import mongoose from "mongoose";
import experiencesModel from "./experiencesModel.js";

const { Schema, model } = mongoose;

const generateAvatar = (f, s) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${f} ${s}`
    )}`;
};

const userSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    image: {
        type: String,
        required: false,
        default: "https://via.placeholder.com/200x200",
    },
    experiences: { type: [experiencesModel] },
    password: {
        type: String,
        default: "password",
    },
});

export default model("User", userSchema);
