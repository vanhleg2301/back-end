import { cvDAO, jobAppliedDAO, jobDAO, userDAO } from "../dao/index.js";

const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobDAO.getAllJobs();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const {
      title,
      // industry,
      // typeOfWork,
      // status,
      location,
      experience,
      minSalary,
      maxSalary,
    } = req.query;

    const query = {};

    if (title) {
      query.title = new RegExp(title, "i");
    }
    if (location) {
      query["location.province"] = new RegExp(location, "i");
    }
    if (experience) {
      query.experience =
        Number(experience) >= 6
          ? { $gte: Number(experience) }
          : Number(experience);
    }

    if (minSalary && maxSalary) {
      if (minSalary === 0 && maxSalary === 0) {
        query.minSalary = minSalary;
        query.maxSalary = maxSalary;
      } else {
        query.$or = [
          {
            $and: [
              { minSalary: { $gte: Number(minSalary) } }, // greater than or equal
              { minSalary: { $lte: Number(maxSalary) } }, // less than or equal
            ],
          },
          {
            $and: [
              { minSalary: { $lte: Number(minSalary) } }, // less than or equal
              { maxSalary: { $gte: Number(minSalary) } }, // greater than or equal
            ],
          },
        ];
      }
    }
    // if (industry) {
    //   query.industry = industry;
    // }
    // if (typeOfWork) {
    //   query.typeOfWork = typeOfWork;
    // }
    // if (status) {
    //   query.status = status;
    // }

    const jobs = await jobDAO.getJobs(query);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await jobDAO.getJobById(jobId);
    res.status(200).json(job);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getJobHaveCv = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await jobAppliedDAO.getJobByJobId(jobId);
    res.status(200).json(job);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getPendingJobs = async (req, res) => {
  try {
    const pendingJobs = await jobDAO.getAllPendingJobs();
    res.status(200).json(pendingJobs);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const approvedJob = await jobDAO.approveJob(jobId);
    res.status(200).json(approvedJob);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const rejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const rejectedJob = await jobDAO.rejectJob(jobId);
    res.status(200).json(rejectedJob);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getJobByID = async (jobId) => {
  try {
    const job = await jobDAO.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  } catch (error) {
    throw error; // Re-throwing the error for centralized error handling
  }
};

const getJobsByRecruiterID = async (req, res) => {
  try {
    const { recruiterID } = req.params;
    const jobs = await jobDAO.getJobByRecruiterID(recruiterID);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getRecruiterJobsWithDetails = async (req, res) => {
  try {
    const { recruiterID } = req.params;
    const jobs = await jobDAO.getJobByRecruiterID(recruiterID);

    const detailsJobs = await Promise.all(
      jobs.map(async (job) => {
        const applications = await jobDAO.getJobById(job.jobId);
        const detailedApplicantions = await Promise.all(
          applications.map(async (application) => {
            const cv = await cvDAO.findById(application.id);
            const user = await userDAO.getUserById(application.id);
            return {
              application,
              cv,
              user,
            };
          })
        );
        return {
          job,
          applications: detailedApplicantions,
        };
      })
    );

    res.json(detailsJobs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const RECRUITER_JOB_LIMITS = {
  1: 5,
  2: 10, 
  3: 15, 
};

const createJob = async (req, res) => {
  try {
    const jobData = req.body;
    const recruiterId = jobData.recruitersID;

    const dataUser = await userDAO.getUserById(recruiterId);
    if (!dataUser) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const recruiterLevel = dataUser.recruiterLevel;
    const recruiterPost= dataUser.jobPostingLimit;
    console.log("level: ", recruiterLevel, "post: ", recruiterPost);

    if (recruiterPost <= 0) {
      return res.status(403).json({ message: "Upgrade your package to be able to post more" });
    }

    // Create job
    const job = await jobDAO.createJob(jobData);

    // Decrease job posting limit for recruiter by 1
    const userPost = await jobDAO.decreaseJobPostingLimit(recruiterId);

    console.log("userPost: ", userPost);

    res.status(201).json(job);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobData = req.body;
    const job = await jobDAO.updateJob(jobId, jobData);
    res.status(200).json(job);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await jobDAO.deleteJob(jobId);
    res.status(200).json(job);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


export default {
  getAllJobs,
  getJobs,
  getJobDetails,
  getPendingJobs,
  createJob,
  updateJob,
  deleteJob,
  approveJob,
  rejectJob,
  getJobByID,
  getJobsByRecruiterID,
  getRecruiterJobsWithDetails,
  getJobHaveCv,
};
