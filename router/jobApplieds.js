import express from 'express';
import { jobAppliedController } from '../controller/index.js';

const jobAppliedRouter = express.Router();

jobAppliedRouter.get('/:applicantId', jobAppliedController.getAppliedJobs);
jobAppliedRouter.post('/apply', jobAppliedController.applyForJob);
jobAppliedRouter.get('/recruiter/:recruiterId', jobAppliedController.getJobsAppliedByRecruiter);
jobAppliedRouter.get('/jobs/:jobID', jobAppliedController.getJobApplication);

jobAppliedRouter.patch('/status/:jobId/:applicantId', jobAppliedController.updateJobStatus);


export default jobAppliedRouter;
