import express from "express";
import { userController } from "../controller/index.js";
import authJWT from "../middleware/authJWT.js";

const userRouter = express.Router();

userRouter.get("/", authJWT.authenticationToken, userController.getAllUsers);
userRouter.get("/user", userController.getAllUsers);

// Đăng nhập người dùng
userRouter.post("/login", userController.login);

userRouter.post("/register", userController.register);
userRouter.post("/regis-recruiter", userController.registerRecruiter);

userRouter.post("/forgot-password/sendmail", userController.sendMail);
userRouter.post("/sendmailJob", userController.sendMailRecruiter);
userRouter.post("/sendMailFrame", userController.sendMailFrame);

userRouter.delete("/logout", userController.deleteRefreshTokes);

userRouter.post("/token", userController.getNewAccessTokens);

userRouter.patch("/:id", userController.updateProfile);
// Get all recruiters
userRouter.get("/recruiters", userController.getAllRecruiters);

// Get invalidated recruiters
userRouter.get(
  "/invalidated-recruiters",
  userController.getInvalidatedRecruiters
);

// Get user detail
userRouter.get("/:userId", userController.getUserDetails);

// Active/Deactive user
userRouter.patch("/:userId/deactive", userController.deactivateUser);
userRouter.patch("/:userId/active", userController.activateUser);

userRouter.get("/active/check/:userId", userController.checkActivateUser);

// recruiter
userRouter.post("/regis-recruiter", userController.registerRecruiter);
userRouter.patch("/:userId/choose-company", userController.chooseCompany);

export default userRouter;
