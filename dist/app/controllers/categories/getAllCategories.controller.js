"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = void 0;
const categories_model_1 = __importDefault(require("../../models/categories.model"));
const getAllCategories = async (req, res) => {
    try {
        // Assuming Category is a Mongoose model similar to User
        const categories = await categories_model_1.default.find();
        return res.status(200).json({ categories });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('Create Category error:', error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCategories = getAllCategories;
