import Industry from "../models/industries.js";
import createError from 'http-errors';

const getAllIndustries = async () => {
    try {
        const industries = await Industry.find({}).exec();
        return industries;
    } catch (error) {
        throw error;
    }
};

export default {
    getAllIndustries
}