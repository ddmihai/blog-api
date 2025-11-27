import { Request, Response } from "express"

export const uploadSingleImage = async (req: Request, res: Response) => {
    const file = req.file as any

    if (!file) {
        return res.status(400).json({
            message: 'No image uploaded',
            status: 0,
        })
    }

    console.log('Uploaded file info:', file)

    const url: string = file.secure_url || file.path
    const publicId: string = file.public_id || file.filename // 👈 use filename

    return res.status(201).json({
        message: 'Image uploaded successfully',
        status: 201,
        url,
        publicId,
    })
}
