import mongoose, { Schema } from "mongoose";
import User from './users.js';

const cvSchema = new Schema({
    fileURL: {
        type: String,
        required: true
    },
    applicantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
}, {
    timestamps: true
});

const CV = mongoose.model("CVs", cvSchema);
export default CV;