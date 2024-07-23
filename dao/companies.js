import Companies from "../models/companies.js";
import createError from "http-errors";

const getAllCompanies = async () => {
  try {
    const companies = await Companies.find({}).exec();
    return companies;
  } catch (error) {
    throw createError(500, error.message);
  }
};

const searchCompanyByName = async (name) => {
  try {
    const companies = await Companies.find({
      companyName: new RegExp(name, "i"),
    });
    return companies;
  } catch (error) {
    throw createError(500, error.message);
  }
};

const getCompanyDetailById = async (id) => {
  try {
    const company = await Companies.findById(id);
    return company;
  } catch (error) {
    throw createError(500, error.message);
  }
};


const createCompany = async (companyData) => {
  try {
    // console.log("Received company data:", companyData); // Log received data for debugging
    const newCompany = new Companies({
      recruiterID: companyData.recruiterID,
      companyName: companyData.companyName,
      email: companyData.email,
      phoneNumber: companyData.phoneNumber,
      location: companyData.location,
      taxNumber: companyData.taxNumber,
      numberOfEmployees: companyData.numberOfEmployees,
      companyStatus: companyData.companyStatus,
      logo: companyData.logo,
      businessLicense: companyData.businessLicense,
    });
    await newCompany.save();
    return newCompany;
  } catch (error) {
    throw createError(500, error.message);
  }
};

const getCompanyByRecruiterId = async (recruiterId) => {
  try {
    const companies = await Companies.findOne({ recruiterID: recruiterId })
      .sort({ createdAt: -1 })  // Sort by createdAt field in descending order
      .populate("recruiterID")
      .exec();
    return companies;
  } catch (error) {
    throw createError(500, error.message);
  }
};


const getCompanyByCompanyId = async (companyId) => {
  try {
    const companies = Companies.find({ _id: companyId }).exec();
    return companies;
  } catch (error) {
    throw error;
  }
};

const activeCompany = async (companyId) => {
  try {
    const job = await Companies.findByIdAndUpdate(
      companyId,
      { companyStatus: 0 },
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

const deactiveCompany = async (companyId) => {
  try {
    const job = await Companies.findByIdAndUpdate(
      companyId,
      { companyStatus: 2 },
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

export default {
  activeCompany,
  deactiveCompany,
  getAllCompanies,
  searchCompanyByName,
  getCompanyDetailById,
  createCompany,
  getCompanyByRecruiterId,
  getCompanyByCompanyId,
};
