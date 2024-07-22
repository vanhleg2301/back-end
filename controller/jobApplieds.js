import { jobAppliedDAO } from "../dao/index.js";
import mongoose from "mongoose";
import { jobDAO } from "../dao/index.js";
import { userDAO } from "../dao/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "../config/firebaseConfig.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAppliedJobs = async (req, res) => {
  const { applicantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(applicantId)) {
    return res.status(400).json({ message: "Invalid applicant ID" });
  }

  try {
    const appliedJobs = await jobAppliedDAO.getAppliedJobsByApplicantId(
      applicantId
    );
    res.status(200).json(appliedJobs);
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const applyForJob = async (req, res) => {
  try {
    let cvFile = req.files.cvFile;
    const { jobId, applicantId, textDes } = req.body;

    // Validate job ID and applicant ID
    const job = await jobDAO.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await userDAO.getUserById(applicantId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reference to the storage location in Firebase
    const fileRef = ref(storage, `uploads/CvApplied/${cvFile.name}`);

    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(fileRef, cvFile.data, {
      contentType: cvFile.mimetype,
    });

    // Get download URL for the file
    const fileURL = await getDownloadURL(snapshot.ref);

    const uploadsDir = path.join(__dirname, "../uploads/CvApplied/");

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadPath = path.join(uploadsDir, cvFile.name);

    // Check if the file already exists
    if (fs.existsSync(uploadPath)) {
      return res.status(500).json({ message: "File already exists." });
    }

    try {
      fs.writeFileSync(uploadPath, cvFile.data);
      // Use DAO to create new JobApplied entry
      const jobApplied = await jobAppliedDAO.appliedForJob(
        jobId,
        applicantId,
        fileURL,
        textDes
      );

      const recruitersID = await jobDAO.getRecruiterIdByJobId(jobId);

      return res.status(200).json({
        success: true,
        message: "Job application successful",
        jobApplied,
        recruitersID,
      });
    } catch (fileError) {
      console.error("Error applying for job:", fileError);
      return res.status(500).json({
        message: "Failed to apply for job",
        error: fileError.message,
      });
    }
  } catch (error) {
    if (error.message === "Applicant has already applied for this job.") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const applyForJobWithYourCv = async (req, res) => {
  try {
    const { jobId, applicantId, cvFile, textDes } = req.body;

    // Validate job ID and applicant ID
    const job = await jobDAO.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await userDAO.getUserById(applicantId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      const jobApplied = await jobAppliedDAO.appliedForJob(
        jobId,
        applicantId,
        cvFile,
        textDes
      );

      const recruitersID = await jobDAO.getRecruiterIdByJobId(jobId);

      return res.status(200).json({
        success: true,
        message: "Job application successful",
        jobApplied,
        recruitersID,
      });
    } catch (fileError) {
      console.error("Error applying for job:", fileError);
      return res.status(500).json({
        message: "Failed to apply for job",
        error: fileError.message,
      });
    }
  } catch (error) {
    if (error.message === "Applicant has already applied for this job.") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getJobsAppliedByRecruiter = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId;
    const jobsApplied = await jobAppliedDAO.getJobsAppliedByRecruiter(
      recruiterId
    );

    res.status(200).json(jobsApplied);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobApplication = async (req, res) => {
  try {
    const jobID = req.params.jobID;
    const jobId = await jobAppliedDAO.getJobApplicationByJobID(jobID);
    if (!jobId || jobId.length === 0) {
      return res.status(404).json({ message: "Job applications not found" });
    }
    res.status(200).json(jobId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJobStatus = async (req, res) => {
  const jobId = req.params.jobId;
  const applicantId = req.params.applicantId;
  const { status } = req.body;

  try {
    const obJob = new mongoose.Types.ObjectId(jobId);
    const obApplicant = new mongoose.Types.ObjectId(applicantId);

    if (status === 0) {
      await jobAppliedDAO.updateJobStatus(obJob, obApplicant, status);
      return res
        .status(200)
        .json({ message: "Job status updated successfully" });
    } else {
      await jobAppliedDAO.rejectJobApplied(obJob, obApplicant);
      return res.send({ message: "Job reject and delete successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export default {
  getAppliedJobs,
  applyForJob,
  applyForJobWithYourCv,
  getJobsAppliedByRecruiter,
  getJobApplication,
  updateJobStatus,
};
