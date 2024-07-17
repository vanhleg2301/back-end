import { industryDAO } from "../dao/index.js";

const getAllIndustries = async (req, res) => {
    try {
        const industries = await industryDAO.getAllIndustries();
        res.status(200).json(industries);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export default {
    getAllIndustries
}