import express from 'express';
import { companiesController } from '../controller/index.js';

const companiesRouter = express.Router();

//get list companies 
companiesRouter.get("/", companiesController.getAllCompanies);
companiesRouter.get('/search', companiesController.searchCompanyByName);
companiesRouter.get('/:id', companiesController.getCompanyDetailById);
companiesRouter.post("/", companiesController.createCompany);
companiesRouter.patch("/", companiesController.patchCompanyId);
companiesRouter.get("/com/:recruiterId", companiesController.getCompanyByRecruiterId);


export default companiesRouter;