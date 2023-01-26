import mongoose from "mongoose";

const { Schema, model } = mongoose;

const experiencesModel = new Schema({
  role: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  }
  // },
  // startDate: {
  //     type: Date,
  //     required: true,
  // },
  // endDate: {
  //     type: Date,
  //     default: null,
  // },
  // description: {
  //     type: String,
  //     required: true,
  // },
  // area: {
  //     type: String,
  //     default: "None given",
  // },
  // image: {
  //     type: String,
  //     default: "https://via.placeholder.com/256x256",
  // },
  // createdAt: {
  //     type: Date,
  //     default: Date.now,
  // },
  // updatedAt: {
  //     type: Date,
  //     default: Date.now,
});

export default experiencesModel;
