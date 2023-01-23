import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postsSchema = new Schema(
  {
    text: { type: String, required: true },
    username: { type: String, required: true },
    image: { type: String, required: false },
    user: [{ type: Schema.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true,
  }
);

export default model("posts", postsSchema);
