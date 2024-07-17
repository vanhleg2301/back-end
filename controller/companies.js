import { companiesDAO, userDAO } from "../dao/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

    // Optionally log the received company data for debugging
    console.log("Received company data:", req.body);

    // Check if both files are uploaded
    if (!req.files.logo || !req.files.businessLicense) {
      return res
        .status(400)
        .send("Both logo and BusinessLicense files are required.");
    }

    let logoFile = req.files.logo;
    let businessLicenseFile = req.files.businessLicense;

    const logoUploadPath = path.join(
      __dirname,
      "../uploads/logo",
      logoFile.name
    );
    const businessLicenseUploadPath = path.join(
      __dirname,
      "../uploads/bussiness",
      businessLicenseFile.name
    );

    // Save the logo file
    logoFile.mv(logoUploadPath, async (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      // Save the BusinessLicense file
      businessLicenseFile.mv(businessLicenseUploadPath, async (err) => {
        if (err) {
          return res.status(500).send(err);
        }

        try {
          // Create a new object containing extracted fields
          const companyData = {
            recruiterID,
            companyName,
            email,
            phoneNumber,
            location,
            taxNumber,
            numberOfEmployees,
            companyStatus,
            logo: `${logoFile.name}`, // Include logo path
            businessLicense: `${businessLicenseFile.name}`, // Include BusinessLicense path
          };

          // Call companyDAO.createCompany to save the company
          const newCompany = await companiesDAO.createCompany(companyData);

          // update companyID in recruiterID
          await userDAO.updateCompanyID(newCompany._id, recruiterID);

          // Respond with status 201 (Created) and the newly created company data
          res.status(200).json(newCompany);
        } catch (error) {
          // If an error occurs, respond with status 500 (Internal Server Error)
          // and send the error message as JSON
          res.status(500).json({ error: error.message });
        }
      });
    });
  } catch (error) {
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
    console.log(user.companyID)
    const companies = await companiesDAO.getCompanyByCompanyId(user.companyID);
    console.log(companies)

    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

const patchCompanyId = async (req, res) => {
  try {
    const { companyId, recruiterID } = req.body;

    if (!companyId || !recruiterID) {
      return res.status(400).json({ error: "Company ID and Recruiter ID are required" });
    }

    const company = await userDAO.updateCompanyID(companyId, recruiterID);
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }

}

export default {
  getAllCompanies,
  searchCompanyByName,
  getCompanyDetailById,
  createCompany,
  patchCompanyId,
  createCompanyWithNoFiles,
  getCompanyByRecruiterId,
};
