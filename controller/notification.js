import mongoose from "mongoose";
import notificationDAO from "../dao/notification.js";

const saveNotification = async (req, res, next) => {
  const { userId } = req.params;
  const { message, linkMeet, jobId } = req.body;

  const obJob = new mongoose.Types.ObjectId(jobId);

  try {
    if (!userId) {
      throw new Error("userId is required");
    }

    const notification = await notificationDAO.saveNotification(
      userId,
      message,
      linkMeet,
      obJob
    );
    res.status(200).json(notification);
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle Mongoose validation errors
      res.status(400).json({ error: error.message });
    } else {
      next(error); // Pass other errors to the error handler middleware
    }
  }
};

const getSavedNotification = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const notifications = await notificationDAO.getSavedNotification(userId);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const AutoDeleteNotification = async () => {
  try {
    await notificationDAO.AutoDeleteNotification();
  } catch (error) {
    console.error("AutoDelete fail:", error);
  }
};

export default {
  saveNotification,
  getSavedNotification,
  AutoDeleteNotification,
};
