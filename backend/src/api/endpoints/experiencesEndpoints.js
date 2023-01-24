import express from "express";
import experiencesModel from "../routes/experiencesModel";
import usersModel from "../routes/usersModel";
import createHttpError from "http-errors";
import mongoose from "mongoose";
const router = express.Router();

router.get("/:id/experiences", async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return next(createHttpError(400, `Must include a valid ID`));

    const user = await usersModel.findById(id);
    if (!user) return next(createHttpError(404, `User not found`));

    res.send(user.experiences);
});

router.get("/:id/experiences/:exp_id", async (req, res, next) => {
    const { id, exp_id } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(exp_id))
        return next(createHttpError(400, `Must include a valid ID`));

    const user = await usersModel.findById(id);
    if (!user) return next(createHttpError(404, `User not found`));

    const experience = user.experiences.find(
        (e) => e._id.toString() === exp_id
    );
    if (!experience) return next(createHttpError(404, `Experience not found`));

    res.send(experience);
});

export default router;
