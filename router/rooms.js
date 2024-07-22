import express from "express";
import Room from "../models/rooms.js";

const roomRouter = express.Router();

// GET route to find a room by roomId
roomRouter.get("/", async (req, res) => {
    const { roomId } = req.body; 
    try {
      const room = await Room.findOne({ roomId: roomId }).exec();
      if (!room) {
        res.status(404).json({ message: "Room ID not found!" });
      } else {
        res.status(200).json({ message: "Room ID found!", room: room });
      }
    } catch (error) {
      res.status(500).json({ message: "Error getting room ID", error });
    }
  });

// POST route to save roomId
roomRouter.post("/:recruiterId", async (req, res) => {
  const { recruiterId } = req.params;
  const { roomId } = req.body;

  try {
    // Assuming Room model has a method to create a room entry
    const newRoom = await Room.create({ recruiterId, roomId });

    res
      .status(200)
      .json({ message: "Room ID saved successfully!", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Error saving room ID", error });
  }
});

export default roomRouter;
