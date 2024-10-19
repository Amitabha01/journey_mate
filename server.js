import app from './app.js';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

import connectionDB from "./config/dbConnection.js";


dotenv.config();

const PORT = process.env.PORT || 5050;

//cloudinary config
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, async function () {
    await connectionDB();

    console.log(`Server is running on port ${PORT}`);
});