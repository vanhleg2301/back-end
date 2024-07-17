import Notification from "../models/notification.js";

const saveNotification = async (userId, message, linkMeet, jobId) => {
  try {
    const notification = new Notification({
      userId,
      message,
      linkMeet,
      jobId
    });
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

const getSavedNotification = async (userId) => {
  try {
    const notifications = await Notification.find({ userId }).exec();
    return notifications;
  } catch (error) {
    throw error;
  }
};

const AutoDeleteNotification = async () => {
  try {
    // Tính ngày trước đó 2 ngày so với hiện tại
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Xóa các thông báo có trường 'createdAt' cũ hơn twoDaysAgo
    const result = await Notification.deleteMany({
      createdAt: { $lt: twoDaysAgo },
    });

    console.log(`Deleted ${result.deletedCount} notifications older than 2 days`);
    return result.deletedCount;
  } catch (error) {
    console.error("AutoDelete fail:", error);
    throw error;
  }
};



export default {
  saveNotification,
  getSavedNotification,
  AutoDeleteNotification
};
