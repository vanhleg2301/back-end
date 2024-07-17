import express from 'express';
import { cvController } from '../controller/index.js';

const cvRouter = express.Router();

cvRouter.post('/upload', cvController.uploadCV);
cvRouter.get('/:applicantID', cvController.getCvByApplicantID);
cvRouter.get('/', cvController.getAllCVs);
cvRouter.delete('/:id', cvController.deleteCVById); // New delete route

export default cvRouter;