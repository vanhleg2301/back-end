import { Server } from "socket.io";
import { v4 as uuidV4 } from "uuid";

const initializeSocket = (server) => {
  const io = new Server(server, {
    serveClient: false,
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Server connected");

    socket.on("connect", () => {
      console.log("Server socket connected");
    });

    // Payment events
    socket.on("joinOrderRoom", (orderCode) => {
      socket.join(orderCode);
      console.log(`User joined order room: ${orderCode}`);
    });

    socket.on("leaveOrderRoom", (orderCode) => {
      socket.leave(orderCode);
      console.log(`User left order room: ${orderCode}`);
    });

    socket.on("paymentUpdated", (data) => {
      console.log("Payment updated:", data);
      io.to(data.orderCode).emit("paymentUpdated",  data);
    });

    // Admin and Recruiter
    socket.on("activeRecruiter", (data) => {
      console.log("Active Recruiter:", data);
      io.emit("activeFromAdmin", data); // Emit notification to all connected clients
    });

    // Recruiter and Applicant
    socket.on("applied", (data) => {
      console.log("Job applied:", data);
      io.emit("notification", data); // Emit notification to all connected clients
    });

    socket.on("accept_applied", (data) => {
      console.log("Accepted:", data);
      io.emit("notification_for_applicant", data); // Emit notification to all connected clients
    });

    socket.on("reject_applied", (data) => {
      console.log("Rejected:", data);
      io.emit("notification_for_applicant", data); // Emit notification to all connected clients
    });

    // Meeting
    socket.on("join-room", (roomId, userId) => {
      console.log(`a new user ${userId} joined room ${roomId}`);
      socket.join(roomId); // Join the room
      socket.broadcast.to(roomId).emit("user-connected", userId); // Broadcast to other users in the room
    });

    socket.on("user-toggle-audio", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
    });

    socket.on("user-toggle-video", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-toggle-video", userId);
    });

    socket.on("user-start-sharing", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-start-sharing", userId);
    });

    socket.on("user-stop-sharing", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-stop-sharing", userId);
    });

    socket.on("user-leave", (userId, roomId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-leave", userId);
    });

    socket.on("disconnect", () => {
      console.log("Server disconnected");
    });
  });
};

export default initializeSocket;
