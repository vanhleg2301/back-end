import { cvDAO } from "../dao/index.js";
import { userDAO } from "../dao/index.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storage } from "../config/firebaseConfig.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadCV = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    let cvFile = req.files.cvFile;
    const applicantID = req.body.applicantID;

    // Validate file type and size
    const allowedExtensions = /pdf|doc|docx/;
    const fileExtension = path.extname(cvFile.name).toLowerCase();
    if (!allowedExtensions.test(fileExtension)) {
      return res.json({ message: "Invalid file type." });
    }

    const sizeFile = cvFile.size <= 5 * 1024 * 1024;
    if (!sizeFile) {
      return res.json({ message: "File size exceeds limit." });
    }

    // Tạo một tham chiếu đến vị trí lưu trữ nơi file sẽ được tải lên
    const fileRef = ref(storage, `uploads/${cvFile.name}`);

    try {
      // Upload file lên Firebase Storage
      const snapshot = await uploadBytes(fileRef, cvFile.data, {
        contentType: cvFile.mimetype,
      });

      // Lấy URL tải xuống cho file
      // const fileURL = `{cvFile.name}`
      const fileURL = await getDownloadURL(snapshot.ref);

      const uploadsDir = path.join(__dirname, "../uploads/");

      // Ensure the uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uploadPath = path.join(__dirname, "../uploads/", cvFile.name);

      // Check if the file already exists
      if (fs.existsSync(uploadPath)) {
        return res.json({ message: "File already exists." });
      }

      // Save the file locally
      cvFile.mv(uploadPath, async (err) => {
        if (err) {
          return res.status(500).send(err);
        }

        // Save the file URL to the database
        const cv = await cvDAO.createCV(fileURL, applicantID);

        res.status(201).json(cv);
      });
      
    } catch (uploadError) {
      console.error("Error uploading to Firebase Storage:", uploadError);
      res.status(500).json({ message: "Failed to upload CV to Firebase Storage", error: uploadError.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to upload CV", error: error.message });
  }
};

const getCvByApplicantID = async (req, res) => {
  // Vanh edited
  try {
    const { applicantID } = req.params;
    if (!applicantID) {
      return res.status(400).json({ error: "Missing applicantID parameter" });
    }

    const cv = await cvDAO.findByApplicantId(applicantID);
    console.log(cv);
    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }
    res.set("Content-Type", "application/pdf"); // Assuming the CV is a PDF file
    res.send(cv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCVById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ error: "Missing CV ID parameter" });
    }

    // Retrieve CV data to get its file name
    const cv = await cvDAO.getCVById(id);

    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Delete CV from the database
    const deletedCV = await cvDAO.deleteCVById(id);

    // Delete CV file from uploads directory
    const filePath = path.join(__dirname, "../uploads/", cv.fileURL);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: "CV deleted successfully", deletedCV });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllCVs = async (req, res) => {
  try {
    const cvs = await cvDAO.getAllCVs();
    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  uploadCV,
  getCvByApplicantID,
  getAllCVs,
  deleteCVById,
};
