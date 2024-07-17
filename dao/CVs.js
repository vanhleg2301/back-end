import CV from "../models/CVs.js";

const createCV = async (fileURL, applicantID) => {
  try {
    const newCV = await CV.create({ fileURL, applicantID });
    return newCV;
  } catch (error) {
    throw error;
  }
};

const findById = async (id) => {
  try {
    const cv = await CV.findById(id);
    return cv;
  } catch (error) {
    throw error;
  }
};

const getCVById = async (id) => {
  try {
    return await CV.findById(id).populate("applicantID");
  } catch (error) {
    throw error;
  }
};

const getAllCVs = async () => {
  try {
    return await CV.find().populate("applicantID");
  } catch (error) {
    throw error;
  }
};

const findByApplicantId = async (id) => {
    try {
      // Assuming CV is your Mongoose model and "applicantID" is a populated field
      return await CV.find({ applicantID: id })
        .populate("applicantID")
        .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
        .exec();
    } catch (error) {
      throw error;
    }
  };

const deleteCVById = async (id) => {
  // Vanh edited
  try {
    // Assume CV is your Mongoose model
    const deletedCV = await CV.findByIdAndDelete(id);
    return deletedCV;
  } catch (error) {
    throw error;
  }
};


const getCvByApplicantId = async (applicantId) => {
  try {
    const cv = await CV.find({ applicantID: applicantId }).populate("applicantID").exec();
    if (!cv.length) {
      console.log(`No CV found for applicant ID: ${applicantId}`);
    } else {
      console.log(cv[0].fileURL);
    }
    return cv;
  } catch (error) {
    console.error('Error fetching CV:', error);
    throw error;
  }
};



export default {
  getCvByApplicantId,
  createCV,
  getCVById,
  getAllCVs,
  findById,
  findByApplicantId,
  deleteCVById,
};
