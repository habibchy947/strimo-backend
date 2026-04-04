import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "../utils/cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async(req, file) => {
        const originalName = file.originalname;
        const fileExtension = originalName.split(".").pop()?.toLocaleLowerCase();
        const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
        
        const uniqueName = Math.random().toString(36).substring(2)+ "-" + Date.now() + "-" + fileNameWithoutExtension;

        let folder = "images";
        if (fileExtension === "pdf") {
            folder = "pdfs";
        } else if (file.fieldname === "file") {
            folder = "posters";
        } else if (file.fieldname === "screenshots") {
            folder = "screenshots";
        }

        return {
            folder: `strimo/${folder}`,
            public_id: uniqueName,
            resource_type: "auto"
        };
    },  
});

export const multerUpload = multer({storage});