import mongoose, { Schema } from 'mongoose';

const industrySchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Industry = mongoose.model("Industries", industrySchema);
export default Industry;