import { Request, Response } from 'express';
import Category from '../../models/categories.model';


export const getAllCategories = async (req: Request, res: Response) => {
    try {
        // Assuming Category is a Mongoose model similar to User
        const categories = await Category.find();
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