import mongoose from "mongoose";

export interface CategoryDocument extends mongoose.Document {
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
};


const CategorySchema = new mongoose.Schema<CategoryDocument>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true },
    },
    { timestamps: true }
);



const Category = mongoose.model<CategoryDocument>("Category", CategorySchema);
export default Category;