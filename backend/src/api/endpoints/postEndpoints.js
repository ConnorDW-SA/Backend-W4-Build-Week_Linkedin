import express from "express";
import postsModel from "../routes/postsModel.js";

import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { mongo } from "mongoose";
import usersModel from "../routes/usersModel.js";

const postsRouter = express.Router();

//POST

postsRouter.post("/", async (req, res, next) => {
    try {
        const newPost = new postsModel(req.body);
        console.log(req.body);
        const doc = await newPost.save();

        res.send(doc);
    } catch (error) {
        next(error);
    }
});
postsRouter.get("/:id/like/:sid", async (req, res, next) => {
    try {
        const post = await postsModel.findById(req.params.id);
        const sid = await usersModel.findById(req.params.sid);
        const like = post.likes.find((l) => l.toString() === req.params.sid);
        if (like) {
            console.log("removing");
            await postsModel.updateOne(
                {
                    _id: req.params.id,
                },
                {
                    $pull: {
                        likes: req.params.sid,
                    },
                }
            );
            res.send({ message: "OK", liked: false });
        } else {
            console.log("adding");
            await postsModel.updateOne(
                {
                    _id: req.params.id,
                },
                {
                    $addToSet: {
                        likes: req.params.sid,
                    },
                }
            );
            res.send({ message: "OK", liked: true });
        }
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
            .limit(mongoQuery.options.limit)
            .populate("user")

            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    model: "User",
                    select: "name surname image",
                },
            });

        for (const post of posts) {
            post.comments = post.comments.reverse();
        }
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

postsRouter.get("/:postId", async (req, res, next) => {
    try {
        const posts = await postsModel.findById(req.params.postId);

        if (posts) {
            res.send(posts);
        } else {
            next(
                createHttpError(
                    404,
                    `post with id ${req.params.postId} not found`
                )
            );
        }
    } catch (error) {
        next(error);
    }
});

// PUT

postsRouter.put("/:postId", async (req, res, next) => {
    try {
        const updatedPost = await postsModel.findByIdAndUpdate(
            req.params.postId,
            req.body,
            { new: true, runValidators: true }
        );

        if (updatedPost) {
            res.send(updatedPost);
        } else {
            next(
                createHttpError(
                    404,
                    `post with id ${req.params.postId} not found`
                )
            );
        }
    } catch (error) {
        next(error);
    }
});

// DELETE

postsRouter.delete("/:postId", async (req, res, next) => {
    try {
        const deletedPost = await postsModel.findByIdAndDelete(
            req.params.postId
        );
        if (deletedPost) {
            res.status(204).send();
        } else {
            next(
                createHttpError(
                    404,
                    `posts with id ${req.params.postId} not found`
                )
            );
        }
    } catch (error) {
        next(error);
    }
});

export default postsRouter;
