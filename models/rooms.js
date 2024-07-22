import mongoose, { Schema } from "mongoose";
import User from "./users.js";

const roomSchema = new Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Room = mongoose.model("rooms", roomSchema);
export default Room;
