import { cvDAO, jobDAO, userDAO } from "../dao/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import from '../middleware/authJWT.js';
import nodemailer from "nodemailer"; // Import nodemailer to send emails
import crypto from "crypto"; // Import crypto to generate secure passwords
import { DateTime } from "luxon";
import User from "../models/users.js";
import { sendMailHelper } from "../utils/helperMail.js";

let refreshTokens = [];

const getAllUsers = async (req, res) => {
  try {
    const users = await userDAO.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
};

const register = async (req, res) => {
  const { username, password, email, fullName } = req.body;
  try {
    // Kiểm tra xem email có tồn tại chưa
    const existingUser = await userDAO.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Kiểm tra xem các trường dữ liệu có hợp lệ không
    if (!username) {
      return res.status(400).json({ message: "Thiếu tên đăng nhập" });
    }
    if (!password) {
      return res.status(400).json({ message: "Thiếu mật khẩu" });
    }
    if (!email) {
      return res.status(400).json({ message: "Thiếu email" });
    }
    if (!fullName) {
      return res.status(400).json({ message: "Thiếu tên đầy đủ" });
    }

    // Hash password trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);

    // Tạo người dùng mới với hash_password
    const newUser = await userDAO.createUser({
      username,
      hash_password,
      email,
      fullName,
      roleID: 1,
      isActive: true,
    });

    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userDAO.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userDAO.deactivateUser(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userDAO.activateUser(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await userDAO.getAllRecruiters();
    res.status(200).json(recruiters);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getInvalidatedRecruiters = async (req, res) => {
  try {
    const invalidatedRecruiters = await userDAO.getAllInvalidatedRecruiters();
    res.status(200).json(invalidatedRecruiters);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const validateRecruiter = async (req, res) => {
  try {
    const { userId } = req.params;
    const recruiter = await userDAO.validateRecruiter(userId);
    res.status(200).json(recruiter);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const registerRecruiter = async (req, res) => {
  const { username, password, email, fullName, phone } = req.body;
  try {
    // Kiểm tra xem email có tồn tại chưa
    const existingUser = await userDAO.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Kiểm tra xem các trường dữ liệu có hợp lệ không
    if (!username) {
      return res.status(400).json({ message: "Thiếu tên đăng nhập" });
    }
    if (!password) {
      return res.status(400).json({ message: "Thiếu mật khẩu" });
    }
    if (!email) {
      return res.status(400).json({ message: "Thiếu email" });
    }
    if (!fullName) {
      return res.status(400).json({ message: "Thiếu tên đầy đủ" });
    }

    // Hash password trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);

    // Tạo người dùng mới với hash_password
    const newUser = await userDAO.createUser({
      username,
      hash_password,
      email,
      fullName,
      phoneNumber: phone,
      roleID: 2,
      isActive: false,
      recruiterLevel: 0,
      jobPostingLimit: 3,
    });

    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

function generateAccessToken(userID) {
  return jwt.sign({ id: userID }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "300s",
  });
}
const generateRefreshToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  // crypto.randomBytes(64).toString("hex");
};

const createRefreshToken = async (userId) => {
  // Find the user by ID and check if they already have a refresh token
  const user = await User.findById(userId);

  // Check if the user already has a refresh token and it hasn't expired
  if (user.refreshToken && user.refreshTokenExpiresAt > Date.now()) {
    // Return the existing refresh token and expiration date if it's still valid
    return {
      token: user.refreshToken,
      expiresAt: user.refreshTokenExpiresAt,
    };
  }

  // If no valid refresh token exists, generate a new one
  const token = generateRefreshToken(userId);
  const expiresAt = DateTime.now().plus({ days: 30 }).toJSDate(); // Expires in 30 days

  // Store the new refresh token and expiration date in the database
  await userDAO.createRefreshToken(userId, token, expiresAt);

  return {
    token,
    expiresAt: expiresAt,
  };
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await userDAO.findUserByUsernameOrEmail(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found. Please check your username/email and try again.",
      });
    }

    const isMatch = await userDAO.comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Incorrect password. Please check your password and try again.",
      });
    }

    const userPayload = { _id: user._id };

    const accessToken = generateAccessToken(userPayload);

    // Call createRefreshToken to either return an existing refresh token or create a new one
    const { token, expiresAt } = await createRefreshToken(user._id);

    // Set the access token in the response header
    res.set("Authorization", "Bearer " + accessToken);

    return res.status(200).json({
      success: true,
      user,
      accessToken,
      refreshToken: token,
      refreshTokenExpiresAt: expiresAt,
    });
  } catch (error) {
    console.error(error);
    let errorMessage = "An error occurred during login";
    if (error.name === "MongoError") {
      errorMessage = "Database error";
    } else if (error.name === "ValidationError") {
      errorMessage = "Validation error";
    }
    return res
      .status(500)
      .json({ success: false, message: errorMessage, error: error.message });
  }
};

const checkActivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userDAO.getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteRefreshTokes = async (req, res) => {
  console.log("returnn: ", refreshTokens);
  refreshTokens = refreshTokens.filter((token) => token != req.body.token);
  res.status(204).json({ success: true });
};

const getNewAccessTokens = async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null)
    return res
      .status(401)
      .json({ success: false, message: "refesh token not found" });
  // Make sure the refresh token is still valid
  if (!refreshTokens.includes(refreshToken))
    return res
      .status(403)
      .json({ success: false, message: "refesh token is invalid" });
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: "false token" });
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, phoneNumber } = req.body;
    console.log("phone: ", phoneNumber);

    // Validate input
    if (!fullName || !phoneNumber) {
      return res
        .status(400)
        .json({ message: "Full name and phoneNumber are required." });
    }

    // Update profile data in database
    const updatedUser = await userDAO.updateProfile(userId, {
      fullName,
      phoneNumber,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update profile data in cookies
    const updatedUserData = {
      ...updatedUser,
      fullName,
      phoneNumber,
    };
    res.cookie("user", updatedUserData); // Example: setting cookie for 1 day

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProfileFake = async (req, res) => {
  try {
    const userId = req.params.id;
    const { profileData, newPassword } = req.body;

    // Validate input (can be expanded as needed)
    if (!profileData && !newPassword) {
      return res
        .status(400)
        .json({ message: "Profile data or new password is required." });
    }

    // Update profile if profileData is provided
    let updatedUser = null;
    if (profileData) {
      updatedUser = await userDAO.updateProfile(userId, profileData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
    }

    // Update password if newPassword is provided
    if (newPassword) {
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
      updatedUser = await userDAO.updatePassword(userId, hashedPassword);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
    }

    res.status(200).json({
      message: "Profile and/or password updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const chooseCompany = async (req, res, next) => {
  try {
    const { userID, companyID } = req.body;
    const updatedUser = await userDAO.chooseCompany(userID, companyID);

    res.status(200).json({
      message: "Updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const sendMail = async (req, res) => {
  const { email } = req.body;

  try {
    // Send the email and get the result
    const result = await sendMailHelper(email);

    // If the email was successfully sent
    if (result.success) {
      res.status(200).json({
        message:
          "Password updated successfully! Check your email for the new password.",
        newpass: result.newPassword,
      });
    }
  } catch (error) {
    console.error("Error in email sending process:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};

const sendMailRecruiter = async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // 587 or 465 or 534
    secure: true, // true for 465, false for other ports
    auth: {
      user: "anhhcvhe161142@fpt.edu.vn", // aceinterviewsp101
      pass: "uxvw zvuj yugl hgsa", // wdp3012024
    },
  });

  const { applicantId, jobId, cv } = req.body;

  try {
    const cv = await cvDAO.getCvByApplicantId(applicantId);
    console.log("cv: ", cv[0].fileURL);
    if (!cv) throw new Error("CV not found");

    const user = await userDAO.getUserById(applicantId);
    console.log("user: ", user);
    if (!user) throw new Error("User not found");

    const job = await jobDAO.getJobById(jobId);
    console.log("job: ", job);
    if (!job) throw new Error("Job not found");

    const recruiterId = await jobDAO.getRecruiterIdByJobId(jobId);
    const recruiterEmail = await userDAO.getRecruiterEmailById(recruiterId);
    console.log("recruiterEmail: ", recruiterEmail);
    if (!recruiterEmail) throw new Error("Recruiter not found");

    const info = await transporter.sendMail({
      from: "anhhcvhe161142@fpt.edu.vn",
      to: recruiterEmail,
      subject: "Email from AceInterview",
      text: `username: ${user.fullName} - cv: ${cv[0].fileURL} applied for job: ${job.title}`,
    });

    res.status(200).send({
      applicantId: applicantId,
      jobId: jobId,
      user: user.fullName,
      job: job.title,
      recruiterEmail: recruiterEmail,
      cv: cv[0].fileURL,
      message: "Hi.",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).send(`Failed to send email: ${error.message}`);
  }
};

const sendMailFrame = async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // 587 or 465 or 534
    secure: true, // true for 465, false for other ports
    auth: {
      user: "anhhcvhe161142@fpt.edu.vn", // aceinterviewsp101
      pass: "uxvw zvuj yugl hgsa", // wdp3012024
    },
  });

  const { userId, message } = req.body;

  try {
    const user = await userDAO.getUserById(userId);
    if (!user) throw new Error("User not found");

    await transporter.sendMail({
      from: "anhhcvhe161142@fpt.edu.vn",
      to: user.email,
      subject: "Email from AceInterview",
      text: message,
    });

    res.status(200).send({
      message: "send mail for user success",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).send(`Failed to send email: ${error.message}`);
  }
};

export default {
  sendMail,
  sendMailRecruiter,
  sendMailFrame,
  getAllUsers,
  getUserDetails,
  deactivateUser,
  activateUser,
  checkActivateUser,
  getAllRecruiters,
  getInvalidatedRecruiters,
  validateRecruiter,
  updateProfileFake,
  login,
  register,
  registerRecruiter,
  chooseCompany,
  updateProfile,
  deleteRefreshTokes,
  getNewAccessTokens,
};
