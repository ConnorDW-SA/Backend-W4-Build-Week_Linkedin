import express from "express";
import dotenv from "dotenv";

dotenv.config();
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  badRequestHandler,
  genericServerErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import postsRouter from "./api/endpoints/postEndpoints.js";
import userRouter from "./api/endpoints/usersEndpoints.js";
import experienceRouter from "./api/endpoints/experiencesEndpoints.js";
import authRouter from "./api/endpoints/auth.js";
import commentsRouter from "./api/endpoints/commentEndpoint.js";
import mongoose from "mongoose";
const server = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());

server.use("/posts", postsRouter);
server.use("/users", userRouter);
server.use("/users", experienceRouter);
server.use("/auth", authRouter);
server.use("/comments", commentsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
