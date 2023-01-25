import express from "express";
const router = express.Router();
import usersModel from "../routes/usersModel.js";
import createHttpError from "http-errors";

router.post("/login", async (req, res, next) => {
    const { username, password } = req.body;

    console.log(req.body);

    if (!username || !password)
        return res.status(400).send({
            message: "Must include required fields",
        });

    try {
        const user = await usersModel.findOne({
            username,
        });

        if (!user)
            return res.status(403).send({
                message: "Invalid username or password",
            });

        if (user.password !== password)
            return res.status(403).send({
                message: "Invalid username or password",
            });

        res.send(user._id);
    } catch (error) {
        next(error);
    }
});
router.post("/signup", async (req, res, next) => {
    const { username, password, email, name, surname, title, bio, area } =
        req.body;

    if (
        !username ||
        !password ||
        !email ||
        !name ||
        !surname ||
        !title ||
        !bio ||
        !area
    )
        return res.status(400).send({
            message: "Must include required fields",
        });

    //first let's check if the user already exists in the database
    try {
        const user = await usersModel.findOne({
            username,
        });

        if (user)
            return res.status(409).send({
                message: "Already exists",
            });

        //user does not exist, let's make a new user
        const nUser = new usersModel({
            username,
            password,
            email,
            name,
            surname,
            title,
            bio,
            area,
        });

        nUser.save((err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                res.status(500).send({ message: "Unknown error" });
            }
        });
    } catch (e) {
        next(e);
    }
});

export default router;
