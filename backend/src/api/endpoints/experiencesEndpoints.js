import express from "express";
import usersModel from "../routes/usersModel.js";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import json2csv from "json2csv";
import { Parser } from "@json2csv/plainjs";
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

// CSV

router.get("/:id/experiences/csv", async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.params.id);
    if (user) {
      const myData = user.experiences;
      const opts = {
        fields: ["role", "company", "startDate"],
      };
      const parser = new Parser(opts);
      const csv = parser.parse(myData);
      console.log(csv);
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=experiences.csv"
      );
      // const destination = res
      // pipeline(user, parser, destination, (err) => {
      //   if (err) console.log(err)
      // })
      res.send(csv);
    } else {
      res.send({ message: "user not found" });
    }
  } catch (err) {
    console.error(err);
  }
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
    if (!experience) return next(createHttpError(404, `Experience not found`));

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
    if (!experience) return next(createHttpError(404, `Experience not found`));

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
