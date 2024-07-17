import mongoose, { Schema } from "mongoose";
import Users from './users.js';
import Jobs from './jobs.js';

const jobAppliedSchema = new Schema({
    jobID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs',
        required: true
    },
    applicantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    fileURL: {
        type: String,
        required: true
    },
    textDes: {
        type: String,
    },
    // Job Status:0 - Accept,1 - Pending, 2 - Reject,
    status: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    strict: true
});

const JobApplied = mongoose.model("JobApplied", jobAppliedSchema);
export default JobApplied;