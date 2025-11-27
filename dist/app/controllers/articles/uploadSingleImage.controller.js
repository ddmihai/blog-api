"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = void 0;
const uploadSingleImage = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: 'No image uploaded',
            status: 0,
        });
    }
    console.log('Uploaded file info:', file);
    const url = file.secure_url || file.path;
    const publicId = file.public_id || file.filename; // 👈 use filename
    return res.status(201).json({
        message: 'Image uploaded successfully',
        status: 201,
        url,
        publicId,
    });
};
exports.uploadSingleImage = uploadSingleImage;
