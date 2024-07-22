import { companiesDAO, userDAO } from "../dao/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "../config/firebaseConfig.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllCompanies = async (req, res) => {
  try {
    const companies = await companiesDAO.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const searchCompanyByName = async (req, res) => {
  try {
    const { name } = req.query;
    const companies = await companiesDAO.searchCompanyByName(name);
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getCompanyDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID parameter is required" });
    }
    const company = await companiesDAO.getCompanyDetailById(id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCompany = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    // Destructure req.body to extract necessary fields
    const {
      recruiterID,
      companyName,
      email,
      phoneNumber,
      location,
      taxNumber,
      numberOfEmployees,
      companyStatus,
    } = req.body;
    
    // Check if both files are uploaded
    if (!req.files.logo || !req.files.businessLicense) {
      return res
        .status(400)
        .send("Both logo and businessLicense files are required.");
    }

    let logoFile = req.files.logo;
    let businessLicenseFile = req.files.businessLicense;

    // Reference to the storage location in Firebase
    const fileRefLogo = ref(storage, `uploads/logo/${logoFile.name}`);
    const fileRefBusiness = ref(
      storage,
      `uploads/business/${businessLicenseFile.name}`
    );

    // Upload files to Firebase Storage
    const snapshotLogo = await uploadBytes(fileRefLogo, logoFile.data, {
      contentType: logoFile.mimetype,
    });
    const snapshotBusiness = await uploadBytes(
      fileRefBusiness,
      businessLicenseFile.data,
      {
        contentType: businessLicenseFile.mimetype,
      }
    );

    // Get download URLs for the files
    const fileURLLogo = await getDownloadURL(snapshotLogo.ref);
    const fileURLBusiness = await getDownloadURL(snapshotBusiness.ref);

    // Define upload paths (if still needed, but Firebase storage handles it)
    // const logoUploadPath = path.join(__dirname, "../uploads/logo", logoFile.name);
    // const businessLicenseUploadPath = path.join(
    //   __dirname,
    //   "../uploads/business",
    //   businessLicenseFile.name
    // );

    // Save company data
    const companyData = {
      recruiterID,
      companyName,
      email,
      phoneNumber,
      location,
      taxNumber,
      numberOfEmployees,
      companyStatus,
      logo: fileURLLogo,
      businessLicense: fileURLBusiness,
    };

    // Call companiesDAO.createCompany to save the company
    const newCompany = await companiesDAO.createCompany(companyData);

    // Update companyID in recruiter's user profile
    await userDAO.updateCompanyID(newCompany._id, recruiterID);

    // Respond with status 200 and the newly created company data
    res.status(200).json(newCompany);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: error.message });
  }
};

const createCompanyWithNoFiles = async (req, res) => {
  try {
    // Destructure req.body to extract necessary fields
    const {
      companyName,
      email,
      phoneNumber,
      location,
      taxNumber,
      numberOfEmployees,
      companyStatus,
    } = req.body;

    // Optionally log the received company data for debugging
    console.log("Received company data:", req.body);

    // Create a new object containing extracted fields
    const companyData = {
      companyName,
      email,
      phoneNumber,
      location,
      taxNumber,
      numberOfEmployees,
      companyStatus,
    };

    // Call companyDAO.createCompany to save the company
    const newCompany = await companiesDAO.createCompany(companyData);

    // Respond with status 201 (Created) and the newly created company data
    res.status(201).json(newCompany);
  } catch (error) {
    // If an error occurs, respond with status 500 (Internal Server Error)
    // and send the error message as JSON
    res.status(500).json({ error: error.message });
  }
};
const getCompanyByRecruiterId = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    if (!recruiterId) {
      return res.status(400).json({ error: "Recruiter ID invalid" });
    }
    const user = await userDAO.getUserById(recruiterId);
    console.log(user.companyID);
    const companies = await companiesDAO.getCompanyByCompanyId(user.companyID);
    console.log(companies);

    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const patchCompanyId = async (req, res) => {
  try {
    const { companyId, recruiterID } = req.body;

    if (!companyId || !recruiterID) {
      return res
        .status(400)
        .json({ error: "Company ID and Recruiter ID are required" });
    }

    const company = await userDAO.updateCompanyID(companyId, recruiterID);
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const activeCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const activeCompany = await companiesDAO.activeCompany(id);
    res.status(200).json(activeCompany);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deactiveCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const activeCompany = await companiesDAO.deactiveCompany(id);
    res.status(200).json(activeCompany);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default {
  activeCompany,
  deactiveCompany,
  getAllCompanies,
  searchCompanyByName,
  getCompanyDetailById,
  createCompany,
  patchCompanyId,
  createCompanyWithNoFiles,
  getCompanyByRecruiterId,
};
