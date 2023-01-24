import mongoose from "mongoose";
import experiencesModel from "./experiencesModel";

const { Schema, model } = mongoose;

const generateAvatar = (f, s) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(`${f} ${s}`)}`;
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
    get: function () {
      return generateAvatar(this.name.charAt(0), this.surname.charAt(0));
    }
  },
  experiences: [experiencesModel]
});

export default model("User", userSchema);
