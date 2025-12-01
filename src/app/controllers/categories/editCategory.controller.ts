// src/app/controllers/categories/updateCategory.controller.ts
import { Request, Response } from "express"
import Category from "../../models/categories.model"


export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const trimmedName = typeof name === "string" ? name.trim() : ""

        if (!trimmedName) {
            return res.status(400).json({ message: "Name is required" })
        }

        // Find existing category
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        // Check for duplicate name (case-insensitive) on another doc
        const duplicate = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
        })

        if (duplicate) {
            return res.status(409).json({ message: "Category name already exists" })
        }

        category.name = trimmedName
        category.description =
            typeof description === "string" && description.trim().length > 0
                ? description.trim()
                : undefined

        await category.save()

        return res.status(200).json({
            message: "Category updated successfully",
            category,
        })
    } catch (error) {
        console.error("Update category error:", error)
        if (error instanceof Error) {
            return res.status(500).json({ message: "Internal server error", error: error.message })
        }
        return res.status(500).json({ message: "Internal server error" })
    }
}
