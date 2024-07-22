import express from "express";
import * as dotenv from "dotenv";
import connectDB from "./database.js";
import cors from "cors";
import path from "path";
import cron from "node-cron";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import {
  companiesRouter,
  jobRouter,
  userRouter,
  cvRouter,
  industryRouter,
  jobAppliedRouter,
  routerPayOs,
  notificationRouter,
  routerPayOsPay,
  roomRouter,
} from "./router/index.js";
import cookieParser from "cookie-parser";
import http from "http"; // Import http to create an HTTP server
import initializeSocket from "./socket.js";
import { notificationController } from "./controller/index.js";

dotenv.config();
// Định nghĩa 1 webserver
const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Kích hoạt middleware cho phép Express đọc json từ body của request
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  fileUpload({
    createParentPath: true,
  })
);
// app.use('/uploads', express.static('uploads'));

//define uri couter
app.use("/company", companiesRouter);
app.use("/job", jobRouter);
app.use("/room", roomRouter);
app.use("/cv", cvRouter);
app.use("/user", userRouter);
app.use("/industry", industryRouter);
app.use("/appliedjobs", jobAppliedRouter);
app.use("/order", routerPayOs);
app.use("/payos", routerPayOsPay);

let notificationRouteUsed = false;

app.use("/notification", notificationRouter);

app.use("/notification", (req, res, next) => {
  notificationRouteUsed = true;
  next();
});

// Chạy hàm AutoDeleteNotification mỗi giờ
// 1Minute - 1Hour - Day of Month - Month - Day of Week
cron.schedule("0 * * * *", async () => {
  if (notificationRouteUsed) {
    try {
      const deletedCount = await notificationController.AutoDeleteNotification();
      if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} notifications older than 2 days`);
      } else {
        console.log("No notifications to delete");
      }
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  } else {
    return
  }
});

// socket
const server = http.createServer(app);
initializeSocket(server); // Initialize the socket connection

const port = process.env.PORT || 3000;

server.listen(port, async () => {
  connectDB();
  console.log(`Webserver is running at http://localhost:${port}`);
});
