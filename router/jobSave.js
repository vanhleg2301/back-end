import express from "express";

const jobSaveRouter = express.Router();

jobSaveRouter.get("/", (req, res) => {
  res.send("Hello from jobSaveRouter");
});

export default jobSaveRouter;
