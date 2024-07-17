import express from "express";
import notificationController from "../controller/notification.js";

const notificationRouter = express.Router();

// notification accept or reject
notificationRouter.post("/:userId", notificationController.saveNotification);
notificationRouter.get("/:userId", notificationController.getSavedNotification);
notificationRouter.delete("/:notificationId", notificationController.deleteNotification);

export default notificationRouter;
