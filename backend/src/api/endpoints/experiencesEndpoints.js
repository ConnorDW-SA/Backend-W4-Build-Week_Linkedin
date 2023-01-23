import express from "express";
const router = express.Router();

router.get("/users", (req, res) => {
    return res.send({ message: "OK" });
});

export default router;
