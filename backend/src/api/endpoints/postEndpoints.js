import express from "express";
import postsModel from "../routes/postsModel.js";

import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { mongo } from "mongoose";

//POST

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new postsModel(req.body);
    const { _id } = await newPost.save();
  } catch (error) {
    next(error);
  }
});

//GET

postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await postsModel.countDocuments(mongoQuery.criteria);
    console.log(total);
    const posts = await postsModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

postsRouter.get("/:postsId", async (req, res, next) => {
  try {
    const posts = await postsModel
      .findById(req.params.postsId)
      .populate({ path: "review", select: "comment rate" });

    if (posts) {
      res.send(posts);
    } else {
      next(
        createHttpError(404, `posts with id ${req.params.postsId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

postsRouter.put("/:postsId", async (req, res, next) => {
  try {
    const updatedPosts = await postsModel.findByIdAndUpdate(
      req.params.postsId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedPosts) {
      res.send(updatedposts);
    } else {
      next(
        createHttpError(404, `posts with id ${req.params.postsId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

postsRouter.delete("/:postsId", async (req, res, next) => {
  try {
    const deletedPosts = await postsModel.findByIdAndDelete(req.params.postsId);
    if (deletedPosts) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `posts with id ${req.params.postsId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default postsRouter;
