"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = void 0;
const categories_model_1 = __importDefault(require("../../models/categories.model"));
const createCategory = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing' });
        }
        const { name, description } = req.body;
        // normalize name
        const nameLower = name.trim().toLowerCase();
        // check if category with the same name already exists
        // Assuming Category is a Mongoose model similar to User
        const existingCategory = await categories_model_1.default.findOne({ name: nameLower });
        if (existingCategory) {
            return res.status(409).json({ message: 'Category already exists' });
        }
        ;
        // create new category
        await categories_model_1.default.create({
            name: nameLower,
            description,
        });
        return res.status(201).json({ message: 'Category created' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('Create Category error:', error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCategory = createCategory;
