import express from "express";
import usersModel from "../routes/usersModel.js";
import createHttpError from "http-errors";
import mongoose from "mongoose";
const router = express.Router();

const doesUserExist = async (req, res, next) => {
    const { id } = req.params;

    if (!id) return next();

    const user = await usersModel.findById(id);

    if (!user) return next(createHttpError(404, `User not found`));

    req.userData = user;

    return next();
};

/*
    GET
*/
router.get("/:id/experiences", doesUserExist, async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(createHttpError(400, `Must include a valid ID`));

    res.send(req.userData.experiences);
});
router.get(
    "/:id/experiences/:exp_id",
    doesUserExist,
    async (req, res, next) => {
        const { id, exp_id } = req.params;
        if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(exp_id))
            return next(createHttpError(400, `Must include a valid ID`));

        const experience = req.userData.experiences.find(
            (e) => e._id.toString() === exp_id
        );
        if (!experience)
            return next(createHttpError(404, `Experience not found`));

        res.send(experience);
    }
);
/*
    POST
*/
router.post("/:id/experiences", doesUserExist, async (req, res, next) => {
    //
});
/*
    PUT
*/
router.put(
    "/:id/experiences/:exp_id",
    doesUserExist,
    async (req, res, next) => {
        //
    }
);
/*
    DELETE
*/
router.delete(
    "/:id/experiences/:exp_id",
    doesUserExist,
    async (req, res, next) => {
        const { id, exp_id } = req.params;
        if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(exp_id))
            return next(createHttpError(400, `Must include a valid ID`));

        const experience = req.userData.experiences.find(
            (e) => e._id.toString() === exp_id
        );
        if (!experience)
            return next(createHttpError(404, `Experience not found`));

        const newExperiences = req.userData.experiences.filter((e) => {
            return e._id.toString() !== exp_id;
        });

        await usersModel.findByIdAndUpdate(id, {
            $set: {
                experiences: newExperiences,
            },
        });

        return res.send({ message: "OK" });
    }
);

export default router;
