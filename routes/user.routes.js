import { Router } from "express";
import { register, login, logout, profile, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/register', upload.single("avater"), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/myprofile', isLoggedIn, profile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


export default router;