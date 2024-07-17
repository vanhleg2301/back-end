import mongoose, { Schema } from "mongoose";
import User from './users.js';

const notificationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    linkMeet: {
        type: String,
    },
    jobId: {
        type: String,
    }
}, {
    timestamps: true,
    strict: false // Allow to add any other fields
});

const Notification = mongoose.model("notifications", notificationSchema);
export default Notification;