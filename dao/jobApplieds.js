import JobApplied from "../models/jobApplieds.js";
import mongoose from "mongoose";

const getAppliedJobsByApplicantId = async (applicantId) => {
  try {
    const appliedJobs = await JobApplied.find({ applicantID: applicantId })
      .populate("jobID")
      .populate("applicantID");
    return appliedJobs;
  } catch (error) {
    throw error;
  }
};

const appliedForJob = async (jobId, applicantId, fileURL, textDes) => {
  try {
    if (!jobId || !applicantId || !fileURL) {
      throw new Error("jobId and applicantId or fileURL are required.");
    }

    // Check if the applicant has already applied for the job
    const existingApplication = await JobApplied.findOne({
      jobID: jobId,
      applicantID: applicantId,
      textDes: textDes,
      fileURL: fileURL,
    });
    if (existingApplication) {
      throw new Error("Applicant has already applied for this job.");
    }

    const jobApplied = await JobApplied.create({
      jobID: jobId,
      applicantID: applicantId,
      textDes: textDes,
      fileURL: fileURL,
      status: 1, // Status set to Pending
    });
    return jobApplied;
  } catch (error) {
    throw error;
  }
};

const getJobsAppliedByRecruiter = async (recruiterId) => {
  try {
    const jobsApplied = await JobApplied.find()
      .populate({
        path: "jobID",
        match: { recruitersID: recruiterId },
        populate: { path: "recruitersID" },
      })
      .populate("applicantID")
      .populate("cvsID");

    return jobsApplied.filter((jobApplied) => jobApplied.jobID !== null);
  } catch (error) {
    throw new Error(
      "Error getting jobs applied by recruiter: " + error.message
    );
  }
};

const getJobByJobId = async (jobId) => {
  try {
    const job = await JobApplied.find({ jobID: jobId })
      .sort({ createdAt: -1 })
      .populate("jobID")
      .populate("applicantID")
      .exec();
    console.log(job);
    return job;
  } catch (error) {
    throw error;
  }
};

const getJobApplicationByJobID = async (jobID) => {
  try {
    const jobId = await JobApplied.find({ jobID })
      .populate("jobID")
      .populate("applicantID")
      .populate("cvsID");
    return jobId;
  } catch (error) {
    throw new Error(`Unable to get job application: ${error}`);
  }
};

const updateJobStatus = async (jobId, applicantId, status) => {
  try {
    await JobApplied.updateOne(
      { jobID: jobId, applicantID: applicantId },
      { $set: { status: status } }
    );
  } catch (error) {
    throw new Error("Error updating job status: " + error.message);
  }
};

const rejectJobApplied = async (jobId, applicantId) => {
  try {
    await JobApplied.findOneAndDelete({
      jobID: jobId,
      applicantID: applicantId,
    });
  } catch (error) {
    throw new Error("Error updating job status: " + error.message);
  }
};

export default {
  getAppliedJobsByApplicantId,
  appliedForJob,
  getJobsAppliedByRecruiter,
  getJobByJobId,
  getJobApplicationByJobID,
  updateJobStatus,
  rejectJobApplied,
};
