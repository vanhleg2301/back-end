import mongoose, { Schema } from "mongoose";
import User from './users.js';

const jobSaveSchema = new Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs',
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

const JobSave = mongoose.model("jobSave", jobSaveSchema);
export default JobSave;