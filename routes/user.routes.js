import { Router } from "express";
import { register, login, logout, profile } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/register', upload.single("avater"), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/myprofile', isLoggedIn, profile);



export default router;