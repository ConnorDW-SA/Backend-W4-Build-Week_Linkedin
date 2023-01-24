import express from "express";
import usersModel from "../routes/usersModel.js";
import createHttpError from "http-errors";

const userRouter = express.Router();

// GET /users

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
    const user = await usersModel.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// POST /users

userRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new usersModel(req.body);
    const existingUser = await usersModel.findOne({
      username: newUser.username
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
    const user = await usersModel.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true
    });
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with id ${req.params.id} not found!`));
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
      next(createHttpError(404, `User with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default userRouter;
