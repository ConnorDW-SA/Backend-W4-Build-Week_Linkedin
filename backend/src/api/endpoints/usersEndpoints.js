import express from "express";
import usersModel from "../routes/usersModel.js";
import createHttpError from "http-errors";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
import pkg from "imgur";
const { ImgurClient } = pkg;
import fs from "fs";
import multer from "multer";

const userRouter = express.Router();

const upload = multer({ dest: "uploads/" });

userRouter.get("/", async (req, res, next) => {
    try {
        const users = await usersModel.find();
        res.send(users);
    } catch (error) {
        next(error);
    }
});

// GET /users/:id

userRouter.get("/:id", async (req, res, next) => {
    try {
        const user = await usersModel
            .findById(req.params.id)
            .populate("requests friends");
        if (user) {
            res.send(user);
        } else {
            next(
                createHttpError(404, `User with id ${req.params.id} not found!`)
            );
        }
    } catch (error) {
        next(error);
    }
});

userRouter.get("/:id/request/:sid", async (req, res, next) => {
    const { id, sid } = req.params;
    try {
        const user = await usersModel.findById(id);
        const sender = await usersModel.findById(sid);

        if (user.friends.includes(sid))
            return res.status(403).send({
                message: "Already friends",
            });
        if (user.requests.includes(id))
            return res.status(403).send({
                message:
                    "You already have a pending friend request to this user",
            });

        //now let's add the sender to the users requests list
        await usersModel.updateOne(
            {
                _id: id,
            },
            {
                $addToSet: {
                    requests: sid,
                },
            }
        );

        res.send({ message: "Friend request sent" });
    } catch (error) {
        next(error);
    }
});

userRouter.get("/:id/accept/:sid", async (req, res, next) => {
    const { id, sid } = req.params;
    try {
        const user = await usersModel.findById(id);
        const sender = await usersModel.findById(sid);

        if (user.friends.includes(sid))
            return res.status(403).send({
                message: "Already friends",
            });
        if (!user.requests.includes(sid))
            return res.status(403).send({
                message: "You don't have a request from this user",
            });
        //add the user to the friends list and remove them from requests
        await usersModel.updateOne(
            {
                _id: id,
            },
            {
                $pull: {
                    requests: sid,
                },
                $addToSet: {
                    friends: sid,
                },
            }
        );
        await usersModel.updateOne(
            {
                _id: sid,
            },
            {
                $pull: {
                    requests: id,
                },
                $addToSet: {
                    friends: id,
                },
            }
        );
        res.send({ message: "Added" });
    } catch (error) {
        next(error);
    }
});
userRouter.get("/:id/remove/:sid", async (req, res, next) => {
    const { id, sid } = req.params;
    try {
        const user = await usersModel.findById(id);
        const sender = await usersModel.findById(sid);

        //remove the user to the friends list and remove them from requests
        await usersModel.updateOne(
            {
                _id: id,
            },
            {
                $pull: {
                    requests: sid,
                    friends: sid,
                },
            }
        );
        await usersModel.updateOne(
            {
                _id: sid,
            },
            {
                $pull: {
                    requests: id,
                    friends: id,
                },
            }
        );
        res.send({ message: "Removed" });
    } catch (error) {
        next(error);
    }
});

// POST /users

userRouter.post("/", async (req, res, next) => {
    try {
        const newUser = new usersModel(req.body);
        const existingUser = await usersModel.findOne({
            username: newUser.username,
        });
        if (existingUser) {
            next(
                createHttpError(
                    400,
                    `User with username ${newUser.username} already exists!`
                )
            );
        }
        const { _id } = await newUser.save();
        res.status(201).send({ _id });
    } catch (error) {
        next(error);
    }
});

// PUT /users/:id

userRouter.put("/:id", async (req, res, next) => {
    try {
        const user = await usersModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                runValidators: true,
                new: true,
            }
        );
        if (user) {
            res.send(user);
        } else {
            next(
                createHttpError(404, `User with id ${req.params.id} not found!`)
            );
        }
    } catch (error) {
        next(error);
    }
});

// DELETE /users/:id

userRouter.delete("/:id", async (req, res, next) => {
    try {
        const user = await usersModel.findByIdAndDelete(req.params.id);
        if (user) {
            res.status(204).send();
        } else {
            next(
                createHttpError(404, `User with id ${req.params.id} not found!`)
            );
        }
    } catch (error) {
        next(error);
    }
});

// PDF

userRouter.get("/:id/pdf", async (req, res, next) => {
    res.setHeader("Content-Disposition", "attachment; filename=cv.pdf");
    try {
        const user = await usersModel.findById(req.params.id);
        const source = await getPDFReadableStream(user);
        const destination = res;
        pipeline(source, destination, (err) => {
            if (err) console.log(err);
        });
    } catch (err) {
        next(err);
    }
});

userRouter.post(
    "/:id/picture",
    upload.single("image"),
    async (req, res, next) => {
        const client = new ImgurClient({ clientId: process.env.IMGUR_CLIENT });
        const { path: filepath } = req.file;
        const user = await usersModel.findById(req.params.id);
        if (user) {
            const response = await client.upload({
                image: fs.createReadStream(filepath),
                type: "stream",
            });
            console.log(response);
            const { id, link, deletehash } = response.data;

            user.image = link;

            usersModel
                .findByIdAndUpdate(req.params.id, user)
                .then((user) => {
                    res.send(user);
                })
                .catch((err) => {
                    next(createHttpError(404, `Error fetching user`));
                });
            // res.status(200).send(user);
        } else {
            next(
                createHttpError(404, `User with id ${req.params.id} not found!`)
            );
        }
    }
);

export default userRouter;
