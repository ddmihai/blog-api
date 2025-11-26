import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.config";



const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: "BlogAPI",
        resource_type: "image",
    }),
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
