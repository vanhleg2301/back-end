import User from "../models/users.js";
import bcrypt from "bcrypt";

import createError from "http-errors";

const getAllUsers = async () => {
  try {
    const users = await User.find({}).exec();
    return users;
  } catch (error) {
    throw createError(500, error.message);
  }
};

const findUserByUsernameAndPassword = async (username, password) => {
  try {
    const user = await User.findOne({ username: username }).exec();

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.hash_password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in findUserByUsernameAndPassword:", error);
    throw createError(500, "Error finding user by username and password");
  }
};

const findUserByEmailAndPassword = async (email, password) => {
  try {
    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.hash_password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in findUserByEmailAndPassword:", error);
    throw createError(500, "Error finding user by email and password");
  }
};

// Find a user by username or email
const findUserByUsernameOrEmail = async (identifier) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: new RegExp("^" + identifier + "$", "i") },
      ],
    }).exec();

    console.log("return: ", identifier);
    console.log("return1: ", user);

    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error in findUserByUsernameOrEmail:", error);
    throw createError(500, "Error finding user by username or email");
  }
};

const comparePassword = async (user, password) => {
  return user.comparePassword(password);
};

const createUser = async (userData) => {
  try {
    const user = await User.create(userData);
    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Error creating user: " + error.message);
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById({_id: userId}).exec();
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const deactivateUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const activateUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};



const getAllRecruiters = async () => {
  try {
    const recruiters = await User.find({ roleID: 2 });
    return recruiters;
  } catch (error) {
    throw error;
  }
};

const getAllInvalidatedRecruiters = async () => {
  try {
    const invalidatedRecruiters = await User.find({
      roleID: 2,
      recruiterStatus: false,
    });
    return invalidatedRecruiters;
  } catch (error) {
    throw error;
  }
};

const validateRecruiter = async (userId) => {
  try {
    // Strict: false for updated unregistered field in schema
    const recruiter = await User.findByIdAndUpdate(
      userId,
      { $set: { recruiterStatus: true } },
      { new: true, strict: false }
    );
    if (!recruiter) {
      throw createError(404, "User not found");
    }
    return recruiter;
  } catch (error) {
    throw error;
  }
};

const chooseCompany = async (userID, companyID) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userID, {
      $set: { companyID: companyID },
    });
    if (!updatedUser) {
      throw createError(404, "User not found");
    }
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const updateProfile = async (userId, profileData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true, runValidators: true }
    );
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (email, newPassword) => {
  try {
    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    const updatedUser = await User.findOneAndUpdate(
        { email: email }, 
        { $set: { hash_password: hashedPassword } }, 
        { new: true } 
      );

    // console.log("updatedUser: ", updatedUser);
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    throw new Error("Error finding user: " + error.message);
  }
};

const getRecruiterEmailById = async (recruiterId) => {
  try {
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      throw createError(404, "Recruiter not found");
    }
    return recruiter.email;
  } catch (error) {
    throw error;  
  } 
}

const createRefreshToken = async (userId, token, expiresAt) => {
  await User.findByIdAndUpdate(userId, {
      refreshToken: token,
      refreshTokenExpiresAt: expiresAt
  }).exec();
};

const updateCompanyID = async (companyId, recruiterID) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      recruiterID,
      { $set: { companyID: companyId } },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    throw error;
  }
}


export default {
  updateCompanyID,
  createRefreshToken,
  getRecruiterEmailById,
  findUserByEmail,
  comparePassword,
  findUserByUsernameOrEmail,
  findUserByUsernameAndPassword,
  createUser,
  findUserByEmailAndPassword,
  getAllUsers,
  updateProfile,
  updatePassword,
  getUserById,
  deactivateUser,
  activateUser,
  getAllRecruiters,
  getAllInvalidatedRecruiters,
  validateRecruiter,
  chooseCompany,
};
