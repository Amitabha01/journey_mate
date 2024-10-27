import path from "path";

import multer from "multer";

const upload = multer({
    // dest: "uploads/",
    limits: { fileSize: 50 * 1024 * 1024 },  //50mb size is max limit
    storage: multer.diskStorage({
        destination: function (_req, file, cb) {
            cb(null, "./uploads");
        },
        filename: function (_req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    fileFilter: function (_req, file, cb) {
        let ext = path.extname(file.originalname);

        if (
            ext !== ".jpg" && 
            ext !== ".jpeg" && 
            ext !== ".png" &&
            ext !== ".webp" &&
            ext !== ".mp4" &&
            ext !== ".mkv" &&
            ext !== ".webm" &&
            ext !== ".pdf"
        ) {
            cb(new Error(`File type is not supported! ${ext}`), false);
            return;
        } 

        cb(null, true);
    }
});  

export default upload;