import { Request, Response } from "express"


export const uploadSingleImage = async (req: Request, res: Response) => {
    const file = req.file as any

    if (!file) {
        return res.status(400).json({
            message: 'No image uploaded',
            status: 0,
        })
    }

    // multer-storage-cloudinary usually puts the URL on file.path
    // or file.secure_url depending on version/config
    const url: string = file.secure_url || file.path

    return res.status(201).json({
        message: 'Image uploaded successfully',
        status: 201,
        url,
        publicId: file.public_id,
    })
}