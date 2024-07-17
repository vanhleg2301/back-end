import express from "express";
import { industryController } from "../controller/index.js";

const industryRouter = express.Router();

// Get all industries
industryRouter.get('/', industryController.getAllIndustries);

export default industryRouter;