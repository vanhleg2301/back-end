import mongoose, { Schema } from 'mongoose';
import User from './users.js';
import Jobs from './jobs.js';

const companySchema = new Schema({
    recruiterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    companyName: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String
    },
    location: {
        type: String,
        // required: true
    },
    taxNumber: {
        type: String,
        // required: true
    },
    numberOfEmployees: {
        type: Number,
        // required: true
    },
    logo: {
        type: String,
        // required: true
    },
    businessLicense: {
        type: String,
        // required: true
    },
    // Company Status: 0 active, 1 pending, 2 reject
    companyStatus: {
        type: Number,
        // required: true
    }
}, {
    timestamps: true,
    strict: false
});

const Company = mongoose.model("Companies", companySchema);
export default Company;