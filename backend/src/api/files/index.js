import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import json2csv from "json2csv";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import UsersModel from "../users/model.js";
import PostsModel from "../posts/model.js";
import createHttpError from "http-errors";

const filesRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "M1/postsImgs",
    },
  }),
}).single("postImg");

filesRouter.post(
  "/posts/:postId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const postId = req.params.postId;
      console.log(req.file);
      const url = req.file.path;
      const updatedPost = await PostsModel.findByIdAndUpdate(
        postId,
        { image: url },
        { new: true, runValidators: true }
      );
      if (updatedPost) {
        res.send("File uploaded successfully");
      } else {
        next(createHttpError(404, `Post with id ${postId} was not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

filesRouter.get("/:userId/pdf", async (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=test.pdf");
  try {
    const userCV = await UsersModel.findById(req.params.userId).populate({
      path: "experience",
    });
    if (userCV) {
      const source = await getPDFReadableStream(userCV);
      const destination = res;
      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});
export default filesRouter;
