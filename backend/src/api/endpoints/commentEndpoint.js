import express from "express";
import createHttpError from "http-errors";
import commentModel from "../routes/commentModel.js";
import commentSchema from "../routes/commentModel.js";
import postsModel from "../routes/postsModel.js";

const commentsRouter = express.Router();

commentsRouter.get("/:postId", async (req, res, next) => {
  try {
    const comments = await commentSchema.find({
      parentPost: req.params.postId,
    });
    if (comments) {
      res.send(comments);
    } else {
      res.send("No comments here!");
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.post("/:postId", async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const newComment = new commentSchema({
        ...req.body,
        parentPost: req.params.postId,
      });
      const { _id } = await newComment.save();
      await postsModel.findByIdAndUpdate(
        req.params.postId,
        { $push: { comments: _id } },
        { new: true }
      );
      res.status(201).send({ _id });
    } else {
      const newComment = new commentSchema({
        ...req.body,
        parentPost: req.params.postId,
      });
      const { _id } = await newComment.save();
      await postsModel.findByIdAndUpdate(
        req.params.postId,
        { $push: { comments: _id } },
        { new: true }
      );
      res.status(201).send({ _id });
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.put("/:commentId", async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const updatedComment = await commentModel.findByIdAndUpdate(
        req.params.commentId,
        { ...req.body },
        { new: true }
      );
      res.send(updatedComment);
    } else {
      const updatedComment = await commentsModel.findByIdAndUpdate(
        req.params.commentId,
        { ...req.body, image: req.file.path },
        { new: true }
      );
      res.send(updatedComment);
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.delete("/:commentId", async (req, res, next) => {
  try {
    const selectedComment = await commentModel.findById(req.params.commentId);
    const postId = selectedComment.parentPost[0];
    const deletedComment = await commentModel.findByIdAndDelete(
      req.params.commentId
    );
    if (deletedComment) {
      await postsModel.findByIdAndUpdate(postId, {
        $pull: { comments: req.params.commentId },
      });
      res.status(204).send();
    } else {
      next(createHttpError(404, `Comment doesnt exist`));
    }
  } catch (error) {
    next(error);
  }
});

export default commentsRouter;
