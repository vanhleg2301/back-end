import Job from "../models/jobs.js";
import createError from "http-errors";
import User from "../models/users.js";

const RECRUITER_JOB_LIMITS = {
  1: 5, // Level 1: 5 jobs
  2: 10, // Level 2: 10 jobs
  3: 20, // Level 3: 20 jobs
  // Add more levels if needed
};

// Decrease job posting limit for recruiter by 1
const decreaseJobPostingLimit = async (recruiterId) => {
  try {
    const recruiter = await User.findByIdAndUpdate(
      recruiterId,
      { $inc: { jobPostingLimit: -1 } },
      { new: true }
    );
    if (!recruiter) {
      throw createError(404, "Recruiter not found");
    }
    console.log("recruiter: ", recruiter);
    return recruiter;
  } catch (error) {
    throw createError(500, error.message);
  }
};


const getAllJobs = async () => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 }).exec();
    return jobs;
  } catch (error) {
    throw createError(500, error.message);
  }
};

const getJobs = async (query) => {
  try {
    return await Job.find(query).populate("recruitersID").populate("industry");
  } catch (error) {
    throw createError(500, error.message);
  }
};

const getJobById = async (jobId) => {
  try {
    const job = await Job.findById(jobId)
      .populate("recruitersID")
      .populate("industry");
    if (!job) {
      throw createError(404, "Job not found");
    }
    return job;
  } catch (error) {
    throw error;
  }
};

const getAllPendingJobs = async () => {
  try {
    const pendingJobs = await Job.find({ status: 2 })
      .populate("recruitersID")
      .populate("industry");
    return pendingJobs;
  } catch (error) {
    throw error;
  }
};

const approveJob = async (jobId) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { status: 1 },
      { new: true }
    );
    if (!job) {
      throw createError(404, "Job not found");
    }
    return job;
  } catch (error) {
    throw error;
  }
};

const rejectJob = async (jobId) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { status: 0 },
      { new: true }
    );
    if (!job) {
      throw createError(404, "Job not found");
    }
    return job;
  } catch (error) {
    throw error;
  }
};

const getJobByRecruiterID = async (recruiterID) => {
  try {
    const query = { recruitersID: recruiterID };
    const jobs = await Job.find(query)
      .populate("recruitersID")
      .populate("industry");
    return jobs;
  } catch (error) {
    throw new Error(error);
  }
};
const createJob = async (jobData) => {
  try {
    const job = new Job(jobData);
    await job.save();
    return job;
  } catch (error) {
    throw createError(500, error.message);
  }
};

const updateJob = async (jobId, jobData) => {
  try {
    const job = await Job.findByIdAndUpdate(jobId, jobData, { new: true })
      .populate("recruitersID")
      .populate("industry");
    if (!job) {
      throw createError(404, "Job not found");
    }
    return job;
  } catch (error) {
    throw error;
  }
};

const deleteJob = async (jobId) => {
  try {
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      throw createError(404, "Job not found");
    }
    return job;
  } catch (error) {
    throw error;
  }
};

const getRecruiterIdByJobId = async (jobId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      throw createError(404, "Job not found");
    }
    return job.recruitersID;
  } catch (error) {
    throw error;
  }
};

export default {
  decreaseJobPostingLimit,
  getAllJobs,
  getRecruiterIdByJobId,
  getJobs,
  getJobById,
  getAllPendingJobs,
  approveJob,
  createJob,
  updateJob,
  deleteJob,
  rejectJob,
  getJobByRecruiterID
};
