import express from 'express';
import { jobController } from '../controller/index.js';

const jobRouter = express.Router();

jobRouter.get('/', jobController.getAllJobs);

//find jobs
jobRouter.get('/find', jobController.getJobs);

// Get job details
jobRouter.get('/:jobId', jobController.getJobDetails);

// Get list cv of job
jobRouter.get('/jobCv/:jobId', jobController.getJobHaveCv);

// GET jobs by recruiters ID /job?recruiterID=12345
jobRouter.get('/recruiter/:recruiterID', jobController.getJobsByRecruiterID);

// GET jobs by recruiters ID with details
jobRouter.get('/:recruiterID/jobs/details', jobController.getRecruiterJobsWithDetails);

// Get all jobs with detail
jobRouter.get('/find', jobController.getJobs);

// Get all pending jobs
jobRouter.get('/pending', jobController.getPendingJobs);

// Create a new job
jobRouter.post('/', jobController.createJob);

// Update a job by ID
jobRouter.put('/:jobId', jobController.updateJob);

// Delete a job by ID
jobRouter.delete('/:jobId', jobController.deleteJob);

// Approve Jobs
jobRouter.patch('/:jobId/approve', jobController.approveJob);

// Reject Jobs
jobRouter.patch('/:jobId/reject', jobController.rejectJob);

export default jobRouter;
